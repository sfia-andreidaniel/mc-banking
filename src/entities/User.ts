import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import bcrypt from 'bcrypt';
import {Validator} from "../validator/Validator";
import {FieldType} from "../validator/FieldType";
import {Transaction} from "./Transaction";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        length: 64,
        unique: true,
    })
    email!: string;

    @Column({
        length: 64
    })
    password!: string;

    @Column({
        type: "int",
        default: 0,
    })
    balance!: number;

    @Column({
        type: "int",
        default: 0,
    })
    lockedBalance!: number;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions!: Transaction[];

    public setPassword(password: string): this {
        this.password = bcrypt.hashSync(password, 10);
        return this;
    }

    public checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }

    public toJson(includeBalance: boolean = false) {
        let result = {
            id: this.id,
            email: this.email,
            balance: includeBalance ? this.balance : undefined,
        };

        return result;
    }

    public static createUserValidator(): Validator {

        const result: Validator = new Validator();

        result.field('email')
            .type(FieldType.STRING)
            .required(true)
            .minLength(6)
            .maxLength(128)
            .withCustomValidator((v: string): boolean => {
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            }, "Value must represent a valid email address");

        result.field('password')
            .type(FieldType.STRING)
            .required(true)
            .minLength(9)
            .withCustomValidator((v: string): boolean => {
                return v.replace(/[^0-9]+/g, '').length >= 3;
            }, "password must contain at least 3 numbers")
            .withCustomValidator((v: string): boolean => {
                return v.replace(/[^a-z]+/g, '').length >= 3;
            }, "password must contain at least 3 lowercase letters")
            .withCustomValidator((v: string): boolean => {
                return v.replace(/[^A-Z]+/g, '').length >= 3;
            }, "password must contain at least 3 uppercase letters")
            .withCustomValidator((v: string): boolean => {
                return v.replace(/[^\!@#\$%^&\*\(\)\-_\+=\[\];:'"\\|`~]+/g, '').length >= 1;
            }, "password must contain at least a special character")
        ;

        return result;
    }

}