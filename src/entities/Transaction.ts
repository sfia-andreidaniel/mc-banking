import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {User} from "./User";
import {Validator} from "../validator/Validator";
import {FieldType} from "../validator/FieldType";

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
}

export enum TransactionType {
    TOP_UP = 'top_up',
    TRANSFER = 'transfer',
}

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "int"})
    amount!: number;

    @CreateDateColumn()
    createdDate!: Date;

    @UpdateDateColumn({type: 'timestamp'})
    lastUpdated!: Date;

    @Column({
        type: "enum",
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status!: TransactionStatus;

    @Column({
        type: "int"
    })
    userId!: number;

    @Column({
        type: "enum",
        enum: TransactionType,
        default: null,
        nullable: true
    })
    type: TransactionType | null = null;

    @Column({
        type: "int",
        nullable: true
    })
    toUserId: number | null = null;

    @ManyToOne(() => User, user => user.transactions)
    user!: User;

    public toJson() {
        return {
            id: this.id,
            status: this.status,
            amount: this.amount,
            type: this.type,
            toUserId: this.toUserId || undefined,
            createdDate: this.createdDate,
            lastUpdated: this.lastUpdated,
        };
    }

    public static createDeleteTransactionRequestValidator(): Validator {
        const result = new Validator();

        result.field('amount')
            .type(FieldType.INT)
            .minValue(0)
            .required(true);

        return result;

    }

    public static createUpdateTransactionRequestValidator(): Validator {
        const result = new Validator();

        result.field('status')
            .type(FieldType.STRING)
            .in([TransactionStatus.FAILED, TransactionStatus.SUCCEEDED])
            .required(false);

        result.field('consent')
            .type(FieldType.BOOLEAN)
            .required(false);

        result.requireConditional('status', (obj: any) => obj.consent === undefined);
        result.requireConditional('consent', (obj: any) => obj.status === undefined);

        return result;
    }

    public static createNewTransactionRequestValidator(): Validator {

        const result = new Validator();

        result.field('amount')
            .type(FieldType.INT)
            .minValue(1)
            .required(true);

        result.field('type')
            .type(FieldType.STRING)
            .in([TransactionType.TOP_UP, TransactionType.TRANSFER])
            .required(true);

        result.field('toUserId')
            .type(FieldType.INT)
            .required(false)
            .minValue(1);

        result.requireConditional('toUserId', (obj: any): boolean => obj.type === TransactionType.TRANSFER);
        result.missConditional('toUserId', (obj: any): boolean => obj.type === TransactionType.TOP_UP);

        return result;

    }
}