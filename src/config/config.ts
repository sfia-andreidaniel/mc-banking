function envAsString(key: string, _default: string): string {
    return process.env[key] || _default || '';
}

function envAsInt(key: string, _default: number): number {
    return parseInt(process.env[key] || String(_default)) || 0;
}

export class Config {

    public readonly database = {
        host: envAsString('MYSQL_DATABASE_HOST', '127.0.0.1'),
        port: envAsInt('MYSQL_DATABASE_PORT', 3306),
        user: envAsString('MYSQL_USER', 'user'),
        password: envAsString('MYSQL_PASSWORD', 'password'),
        database: envAsString('MYSQL_DATABASE', 'database'),
    };

    public readonly listen = {
        interface: envAsString('HTTP_LISTEN_INTERFACE', '0.0.0.0'),
        port: envAsInt('HTTP_LISTEN_PORT', 3000),
    };

    public readonly transactions = {
        topUp: {
            minAmount: envAsInt('TRANSACTIONS_TOP_UP_MIN', 100),
            maxAmount: envAsInt('TRANSACTIONS_TOP_UP_MAX', 5000 * 100),
        },
        transfer: {
            maxTransferableAmountPerDay: envAsInt('TRANSACTIONS_TRANSFER_MAX_DAILY_AMOUNT', 100000 * 100),
            maxDifferentTransactionsToDifferentUsersPerDay: envAsInt('TRANSACTIONS_TRANSFER_MAX_PER_DAY', 5),
        }
    };

    public readonly jwt = {
        secret: envAsString("JWT_SECRET_KEY", "secret_key"),
    };

}