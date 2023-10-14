import express from 'express';

require("reflect-metadata");
import bodyParser from 'body-parser';
import authenticationRouter from './routes/authenticationRouter';
import transactionRouter from "./routes/transactionRouter";
import {User} from "./entities/User";
import {Config} from "./config/config";

declare global {
    namespace Express {
        interface Request {
            user: User | null;
        }
    }
}

const config = new Config();
const app = express();

console.log("===========");
console.log("config.listen.interface: ", config.listen.interface);
console.log("config.listen.port: ", config.listen.port);
console.log("config.database.database: ", config.database.database);
console.log("config.database.host: ", config.database.host);
console.log("config.database.port: ", config.database.port);
console.log("config.database.user: ", config.database.user);
console.log("config.database.password: ", config.database.password);
console.log("config.transactions.transfer.maxTransferableAmountPerDay: ", config.transactions.transfer.maxTransferableAmountPerDay);
console.log("config.transactions.transfer.maxDifferentTransactionsToDifferentUsersPerDay: ", config.transactions.transfer.maxDifferentTransactionsToDifferentUsersPerDay);
console.log("config.transactions.topUp.maxAmount: ", config.transactions.topUp.maxAmount);
console.log("config.transactions.topUp.minAmount: ", config.transactions.topUp.minAmount);
console.log("config.jwt.secret: ", config.jwt.secret);
console.log("===========");

app.use(bodyParser.json());
app.use('/api/auth', authenticationRouter);
app.use('/api/transactions', transactionRouter)

app.listen(config.listen.port, config.listen.interface, () => {
    console.log(`* HTTP listening on ${config.listen.interface}:${config.listen.port}`);
});