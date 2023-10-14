import {Request, Response} from "express";
import {TransactionService} from "../services/TransactionService";
import {getPaginationFromRequest} from "../types/PaginationInterface";
import {Transaction} from "../entities/Transaction";
import {errorFormatter} from "../helpers/errorFormatter";

const transactionsService = new TransactionService();

export const getAllUserTransactions = async (req: Request, res: Response,) => {

    try {

        let pagination = getPaginationFromRequest(req);

        let transactions = await transactionsService.getAllUserTransactions(req.user!, pagination);

        res.status(200).json({
            data: transactions.map((tr) => tr.toJson()),
            meta: {
                page: pagination.page,
                take: pagination.take,
            }
        });

    } catch (e) {

        res.status(406).json(errorFormatter(e));

    }
}

export const getUserTransactionById = async (req: Request, res: Response) => {

    try {

        let transactionId: number = parseInt(String(req.params.id));

        let transaction = await transactionsService.getUserTransactionById(req.user!, transactionId);

        res.status(200).json(transaction.toJson());

    } catch (e) {

        res.status(406).json(errorFormatter("Failed to fetch transaction"));

    }

}

export const deleteTransaction = async (req: Request, res: Response) => {

    try {

        let errors = Transaction.createDeleteTransactionRequestValidator().validate(req.body);

        if (errors !== null) {
            return res.status(422).json(errorFormatter(errors));
        }

        let transactionId: number = parseInt(String(req.params.id), 10);

        let amount: number = parseInt(String(req.body.amount), 10);

        await transactionsService.deleteTransactionByIdAndAmount(req.user!, transactionId, amount);

        res.status(200).json({
            deleted: true
        });

    } catch (e) {

        res.status(406).json(errorFormatter(e));

    }

};

export const updateTransaction = async (req: Request, res: Response) => {

    try {

        let errors = Transaction.createUpdateTransactionRequestValidator().validate(req.body);

        if (errors !== null) {
            return res.status(422).json(errors);
        }

        let transactionId: number = parseInt( String(req.params['id']), 10);

        let { status, consent } = req.body;

        res.status(200).json((await transactionsService.updateTransaction(req.user!, transactionId, status, consent)).toJson());

    } catch (e) {

        res.status(406).json(errorFormatter(e));

    }

}

export const createTransaction = async (req: Request, res: Response) => {

    try {

        let errors = Transaction.createNewTransactionRequestValidator().validate(req.body);

        if (errors !== null) {
            return res.status(422).json(errorFormatter(errors));
        }

        let {amount, type, toUserId} = req.body;

        let transaction = new Transaction();

        transaction.amount = amount;
        transaction.userId = req.user!.id;
        transaction.type = type;
        transaction.toUserId = toUserId || null;

        res.status(201).json((await transactionsService.createNewTransaction(req.user!, transaction)).toJson());

    } catch (e) {

        res.status(406).json(errorFormatter(e));

    }

}