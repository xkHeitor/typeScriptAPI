import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { Application } from 'express';
import * as database from '@src/database';
import { UsersController } from './controllers/users';
import logger from './logger';

export class SetupServer extends Server {

    constructor (private port = 3000) {
        super();
    }

    public async init(): Promise<void> {
        this.setupExpress();
        this.setupController();
        await this.databaseSetup();
    }

    public getApp(): Application {
        return this.app;
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
    }

    private setupController(): void {
        const forecastController = new ForecastController();
        const userController = new UsersController();
        const beachesController = new BeachesController();
        
        this.addControllers([
            userController, forecastController, beachesController
        ]);
    }

    private async databaseSetup(): Promise<void> {
        await database.connect();
    }

    public async close(): Promise<void> {
        await database.close();
    }

    public start (): void {
        this.app.listen(this.port, () => {
            logger.info(`Server listening of port: ${this.port}`);
        })
    }
}