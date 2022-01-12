import _  from 'lodash';
import logger from "@src/logger";
import { StormGlass } from "@src/clients/stormGlass/stormGlass";
import { ForecastPoint } from "@src/clients/stormGlass/stormGlassTypes";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/errors/internal-error";
import { Rating } from "./rating";

export interface TimeForecast {
    time: string;
    forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
        super(`Unexpected error during the forecast processing: ${message}`);    
    }
}

export class Forecast {

    constructor(protected stormGlass = new StormGlass(), protected RatingService: typeof Rating = Rating) {}

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        try {
            const beachForecast = await this.calculateRating(beaches);
            const timeForecast = this.mapForecastByTime(beachForecast);
            return timeForecast.map((t) => ({
                time: t.time,
                forecast: _.orderBy(t.forecast, [ 'rating' ], [ 'desc' ])
            }));
        } catch (err: any) {
            logger.error(err)
            throw new ForecastProcessingInternalError(err?.message); 
        }
    }

    private enrichedBeachData (points: ForecastPoint[], beach: Beach, rating: Rating): BeachForecast[] {
        return points.map(point => ({
            ... {},
            ... {
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: rating.getRateForPoint(point),
            }, ... point
        }));
    }

    private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
        const pointsWithCorrectSources: BeachForecast[] = [];
        logger.info(`Preparing the forecast for ${beaches?.length} beaches`)
        for (const beach of beaches) { 
            const rating = new this.RatingService(beach);
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
            const enrichedBeachData = this.enrichedBeachData(points, beach, rating);
            pointsWithCorrectSources.push(...enrichedBeachData);
        }
        
        return pointsWithCorrectSources;
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = [];
        for (const point of forecast) {
            const timePoint = forecastByTime.find( f => f.time == point.time);
            if (timePoint) 
                timePoint.forecast.push(point);
            else 
                forecastByTime.push({
                    time: point.time,
                    forecast: [ point ]
                });
        }

        return forecastByTime;
    }

}