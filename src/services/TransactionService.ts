import {AppDataSource} from "../data-source";
import {User} from "../entities/User";
import {Transaction, TransactionStatus, TransactionType} from "../entities/Transaction";
import {DataSource, Repository} from "typeorm";
import {PaginationInterface} from "../types/PaginationInterface";
import {Config} from "../config/config";

export class TransactionService {

    private readonly transactionRepository: Repository<Transaction>;
    private readonly dataSource: DataSource;
    private readonly userRepository: Repository<User>;
    private readonly config: Config;

    public constructor() {
        this.transactionRepository = AppDataSource.getRepository(Transaction);
        this.userRepository = AppDataSource.getRepository(User);
        this.dataSource = AppDataSource;
        this.config = new Config();
    }

    public async countUserTransactionsByState(user: User, status: TransactionStatus): Promise<number> {
        const count: number = await this.transactionRepository.count({
            where: {
                userId: user.id,
                status: status
            }
        });
        return count;
    }

    public async getAllUserTransactions(user: User, pagination: PaginationInterface): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: {userId: user.id},
            take: pagination.take,
            skip: (pagination.page - 1) * pagination.take
        });
    }

    public async getUserTransactionById(user: User, transactionId: number): Promise<Transaction> {
        return this.transactionRepository.findOneOrFail({
            where: {
                userId: user.id,
                id: transactionId
            }
        });
    }

    public async getListWithUserIDsOfTransactionsForCurrentDay(user: User): Promise<number[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day.

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Set the time to the beginning of the next day.

        const results = await this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.createdDate >= :startDate', {startDate: today})
            .andWhere('transaction.createdDate < :endDate', {endDate: tomorrow})
            .andWhere('transaction.status = :status', {status: TransactionStatus.SUCCEEDED})
            .andWhere('transaction.type = :type', {type: TransactionType.TRANSFER})
            .select('transaction.toUserId', 'toUserId')
            .getRawMany();

        return results.map((result) => parseInt(result.toUserId, 10));
    }

    public async getSumOfTransactionAmountsForCurrentDay(user: User): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day.

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Set the time to the beginning of the next day.

        const result = await this.transactionRepository
            .createQueryBuilder('transaction')
            .where('transaction.user = :user', {user: user.id})
            .andWhere('transaction.status = :status', {status: TransactionStatus.SUCCEEDED})
            .andWhere('transaction.createdDate >= :startDate', {startDate: today})
            .andWhere('transaction.createdDate < :endDate', {endDate: tomorrow})
            .select('SUM(transaction.amount)', 'sum')
            .getRawOne();

        return parseFloat(result.sum) || 0;
    }

    public async createNewTransaction(creator: User, transaction: Transaction): Promise<Transaction> {

        let result: Transaction;

        await this.dataSource.transaction(async () => {

            creator = await this.userRepository.findOneOrFail({where: {id: creator.id}});

            if (transaction.type === TransactionType.TRANSFER) {
                if (transaction.amount > this.config.transactions.transfer.maxTransferableAmountPerDay) {
                    throw new Error("Amount too big");
                }
            }

            let totalTransactionsInPendingMode = await this.countUserTransactionsByState(creator, TransactionStatus.PENDING);

            if (totalTransactionsInPendingMode > 0) {
                throw new Error("An existing transacting in pending mode already exists");
            }

            this.checkBalanceOfSourceUser(transaction, creator);

            this.validateTopUpTransaction(transaction);

            await this.lockBalanceOnTopUpTransaction(transaction, creator);

            let targetUser: User | null;

            targetUser = await this.validateTransferTransaction(transaction);

            result = new Transaction();

            result.user = creator;
            result.userId = creator.id;
            result.amount = transaction.amount;
            result.status = TransactionStatus.PENDING;
            result.type = transaction.type;
            result.toUserId = targetUser?.id || null;

            await this.transactionRepository.save(result);

        });

        return result!;

    }

    private async validateTransferTransaction(transaction: Transaction) {
        try {
            return await this.getTransactionTargetUser(transaction);
        } catch (e) {
            throw new Error("Target user account not found!");
        }
    }

    private validateTopUpTransaction(transaction: Transaction) {
        if (transaction.type === TransactionType.TOP_UP) {

            if (transaction.amount < this.config.transactions.topUp.minAmount) {
                throw new Error("Amount must be >= than " + this.config.transactions.topUp.minAmount);
            }

            if (transaction.amount > this.config.transactions.topUp.maxAmount) {
                throw new Error("Amount must be <= than " + this.config.transactions.topUp.maxAmount);
            }

        }
    }

    public async deleteTransactionByIdAndAmount(creator: User, transactionId: number, amount: number)
    {
        await this.dataSource.transaction(async () => {

            let transaction: Transaction;

            try {

                transaction = await this.transactionRepository.findOneOrFail({
                    where: {
                        id: transactionId,
                        userId: creator.id
                    }
                });

            } catch (e) {
                throw new Error('Failed to fetch transaction');
            }

            if (transaction.amount !== amount) {
                throw new Error(
                    'Transaction amount mismatch!'
                );
            }

            if (transaction.status !== TransactionStatus.PENDING) {
                throw new Error(
                    'Transaction not in pending state',
                );
            }

            creator = await this.userRepository.findOneOrFail({
                where: {
                    id: creator.id,
                }
            });

            await this.transactionRepository.delete({
                id: transaction.id
            });

            if (transaction.type === TransactionType.TRANSFER) {

                creator.lockedBalance -= transaction.amount;
                creator.balance += transaction.amount;

            }

            await this.userRepository.save(creator);

        });
    }

    public async updateTransaction(
        creator: User,
        transactionId: number,
        newStatus: TransactionStatus | undefined,
        consent: boolean | undefined
    ): Promise<Transaction> {

        let result!: Transaction;

        await this.dataSource.transaction(async () => {

            creator = await this.userRepository.findOneOrFail({where: {id: creator.id}});

            let transaction: Transaction;

            try {

                transaction = await this.transactionRepository.findOneOrFail({
                    where: {
                        userId: creator.id,
                        id: transactionId
                    }
                });

            } catch (e) {

                throw new Error("Transaction not found!");

            }

            if (newStatus === TransactionStatus.PENDING) {
                throw new Error("New status cannot be 'pending'");
            }

            if (transaction.status !== TransactionStatus.PENDING) {
                throw new Error("Transaction must be in status 'pending'");
            }

            if (newStatus === TransactionStatus.SUCCEEDED && consent === false) {
                throw new Error("If consent is false, status can be either 'failed' or missing");
            }

            if (consent === false && newStatus === undefined) {
                newStatus = TransactionStatus.FAILED;
            }

            if (consent === true && newStatus === undefined) {
                newStatus = TransactionStatus.SUCCEEDED;
            }

            if (undefined === newStatus) {
                throw new Error("status is missing");
            }

            transaction.status = newStatus;

            switch (transaction.type) {

                case TransactionType.TRANSFER:

                    if (newStatus === TransactionStatus.SUCCEEDED) {

                        await this.validateTransferTransactionTypeConditions(creator, transaction);

                        creator.lockedBalance -= transaction.amount;

                        await this.userRepository.update(creator.id, {lockedBalance: creator.lockedBalance});

                        let targetUser: User = await this.userRepository.findOneOrFail({
                            where: {id: transaction.toUserId!}
                        });

                        targetUser.balance += transaction.amount;

                        await this.userRepository.update(targetUser.id, {balance: targetUser.balance});

                    }

                    if (newStatus === TransactionStatus.FAILED) {

                        creator.lockedBalance -= transaction.amount;
                        creator.balance += transaction.amount;

                        await this.userRepository.update(creator.id, {lockedBalance: creator.lockedBalance, balance: creator.balance});
                    }

                    break;

                case TransactionType.TOP_UP:

                    if (newStatus === TransactionStatus.SUCCEEDED) {

                        creator.balance += transaction.amount;

                        await this.userRepository.update(creator.id, {balance: creator.balance});

                    }

                    break;
            }

            result = await this.transactionRepository.save(transaction);

        });

        return result;

    }

    private async validateTransferTransactionTypeConditions(creator: User, transaction: Transaction) {

        if (transaction.amount > creator.balance) {
            throw new Error("Not enough balance to perform transfer");
        }

        let sumOfTransactionsForToday = await this.getSumOfTransactionAmountsForCurrentDay(creator);

        if (sumOfTransactionsForToday + transaction.amount > this.config.transactions.transfer.maxTransferableAmountPerDay) {
            throw new Error('Maximum amount allowed daily is reached');
        }

        let uniqueUsersWhichReceivedTransfersToday: number[] = await this.getListWithUserIDsOfTransactionsForCurrentDay(creator);

        if (uniqueUsersWhichReceivedTransfersToday.length + 1 > this.config.transactions.transfer.maxDifferentTransactionsToDifferentUsersPerDay) {
            throw new Error('Too many transactions made for today. Try again tomorrow');
        }
    }

    private async getTransactionTargetUser(transaction: Transaction): Promise<User | null> {

        if (transaction.type === TransactionType.TRANSFER) {
            return await this.userRepository.findOneOrFail({where: {id: Number(transaction.toUserId)}});
        }

        return null;

    }

    private checkBalanceOfSourceUser(transaction: Transaction, fromUser: User): void {
        if (transaction.type === TransactionType.TRANSFER) {
            // check if current user has balance
            if (fromUser.balance < transaction.amount) {
                throw new Error("Insufficient funds");
            }
        }
    }

    private async lockBalanceOnTopUpTransaction(transaction: Transaction, creator: User) {
        if (transaction.type === TransactionType.TRANSFER) {

            creator.balance -= transaction.amount;

            creator.lockedBalance += transaction.amount;

            await this.userRepository.update(creator.id, {
                balance: creator.balance,
                lockedBalance: creator.lockedBalance,
            });
        }
    }
}