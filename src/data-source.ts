import "reflect-metadata";
import {DataSource, DataSourceOptions} from "typeorm";
import {Config} from "./config/config";

const config = new Config();

export const dataSourceOptions: DataSourceOptions = {
    type: "mysql",
    "host": config.database.host,
    "port": config.database.port,
    "username": config.database.user,
    "password": config.database.password,
    "database": config.database.database,
    "entities": [__dirname + "/entities/*.ts"],
    "synchronize": true,
    "migrations": [__dirname + "/migration/*.ts"],
    "migrationsRun": true,
    "cache": false
};

export const AppDataSource = new DataSource(dataSourceOptions);

AppDataSource.initialize();
