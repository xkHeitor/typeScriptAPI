import { InternalError } from "@src/util/errors/internal-error";
import { AxiosStatic } from "axios";

export interface StormGlassPointSource {
    [Key: string]: number;
}

export interface StormGlassPoint {
    readonly time: string;
    readonly windDirection: StormGlassPointSource;
    readonly waveHeight: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly swellDirection:StormGlassPointSource;
    readonly swellHeight: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly windSpeed: StormGlassPointSource;    
}

export interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
}

export interface ForecastPoint {
    time: string;
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export class ClientRequestError extends InternalError {
    constructor(message: string){
        const internalMessage = '`Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);    
    }
} 

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage = 'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);   
    }
}

export class StormGlass {
 
    readonly stormGlassAPI          = 'https://api.stormglass.io/v2/weather/point';
    readonly stormGlassAPIParams    = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource    = 'noaa';

    constructor(protected request: AxiosStatic) {}

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        try {
            const res = await this.request.get<StormGlassForecastResponse>(
                `${this.stormGlassAPI}?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${lng}`,
                {
                    headers: {
                        Authorization: 'fake-token'
                    }
                }
            );

            return this.normalizeResponse(res.data);
        } catch (err: any) {
            if (err.response && err.response.status)
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
            }));
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