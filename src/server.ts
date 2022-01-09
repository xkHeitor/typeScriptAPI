import './util/module-alias';
import { Application } from 'express';
import bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import { ForecastController } from './controllers/forecast';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import * as database from '@src/database';
import logger from './logger';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import config from 'config';
import swaggerUi from 'swagger-ui-express';
import apiSchema from './api-schema.json';

export class SetupServer extends Server {

    constructor (private port = 3000) {
        super();
    }

    public async init(): Promise<void> {
        this.setupExpress();
        await this.docsSetup();
        this.setupController();
        await this.databaseSetup();
    }

    public getApp(): Application {
        return this.app;
    }
    
    public start (): void {
        this.app.listen(this.port, () => {
            logger.info(`Server listening of port: ${this.port}`);
        })
    }

    public async close(): Promise<void> {
        await database.close();
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
        this.app.use(cors({ origin: '*' }));
        if (config.get('App.logger.enabled'))
            this.app.use(expressPino(logger));
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

    private async docsSetup(): Promise<void> {
        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    }

}