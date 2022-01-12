export interface StormGlassPointSource {
    [Key: string]: number;
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