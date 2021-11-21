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

export class StormGlass {
 
    readonly stormGlassAPI          = 'https://api.stormglass.io/v2/weather/point';
    readonly stormGlassAPIParams    = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource    = 'noaa';

    constructor(protected request: AxiosStatic) {}

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        const res = await this.request.get<StormGlassForecastResponse>(
            `${this.stormGlassAPI}?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${lng}`
        );

        return this.normalizeResponse(res.data);
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