import config, { IConfig } from "config";
import * as HTTPUtil from '@src/util/request'
import { TimeUtil } from "@src/util/time";
import { StormGlassResponseError, ClientRequestError } from "./stormGlassErrors"
import { ForecastPoint, StormGlassForecastResponse, StormGlassPoint, StormGlassPointSource } from "./stormGlassTypes";

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass');

export class StormGlass {
 
    readonly stormGlassAPISource    = 'noaa';
    readonly stormGlassAPIParams    = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

    constructor(protected request = new HTTPUtil.Request()) {}

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        const endTimeStamp = TimeUtil.getUnixTimeForAFutureDay(1);
        try {
            const response = await this.request.get<StormGlassForecastResponse>(
               `${stormGlassResourceConfig.get('apiUrl')}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=${endTimeStamp}`,
                { headers: { Authorization: stormGlassResourceConfig.get('apiToken') } }
            );

            return this.normalizeResponse(response.data);
        } catch (err: any) {
            if (HTTPUtil.Request.isRequestError(err))
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(err.response.data)} Code: ${err.response.status}`
                );

            throw new ClientRequestError(err.message);
        }
    }

    private normalizeResponse (points: StormGlassForecastResponse): ForecastPoint[] {
        return points.hours.filter(this.isValidPoint.bind(this))
            .map(point => ({
                time: point.time,
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource],
            })
        );
    }

    private isValidPoint(point: Partial<StormGlassPoint>):boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }

}