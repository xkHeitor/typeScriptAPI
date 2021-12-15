import { Controller, Get } from "@overnightjs/core";
import { Beach } from "@src/models/beach";
import { Forecast } from "@src/sevices/forecast";
import { Request, Response } from "express";

const forecast = new Forecast();

@Controller('forecast')
export class ForecastController {

    @Get('')
    public async getForecastForLoggedUser(_: Request, res: Response): Promise<void> {
        const beaches = await Beach.find({});
        const forecastData = await forecast.processForecastForBeaches(beaches);
        res.status(200).send(forecast);
    }

}