import { ForecastPoint } from "@src/clients/stormGlass/stormGlassTypes";
import { Beach, GeoPosition } from "@src/models/beach";

// meters
const WaveHeights = {
	ankleToKnee: {
		min: 0.3,
		max: 1.0,
	},
	waistHigh: {
		min: 1.0,
		max: 2.0,
	},
	headHigh: {
		min: 2.0,
		max: 2.5,
	},
};

export class Rating {
	
	constructor (private beach: Beach) {}

	public getRateForPoint(point: ForecastPoint): number {
		const swellDirection = this.getPositionFromLocation(point.swellDirection);
		const windDirection = this.getPositionFromLocation(point.windDirection);
		const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(swellDirection, windDirection);
		const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
		const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
		const finalRating = (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
		return Math.round(finalRating);
	}
	
	public getRatingBasedOnWindAndWavePositions(wavePosition: GeoPosition, windPosition: GeoPosition): number {
		if (wavePosition == windPosition) {
			return 1;
		} else if (this.isWindOffShore(wavePosition, windPosition)) {
			return 5;
		}
		
		return 3;
	}

	public getRatingForSwellPeriod(period: number): number {
		if (period >= 7 && period < 10) {
			return 2;
		}

		if (period >= 10 && period < 14) {
			return 4;
		}

		if (period >= 14) {
			return 5;
		}
		
		return 1;
	}

	public getRatingForSwellSize(height: number): number {
		if (height >= WaveHeights.ankleToKnee.min && height <= WaveHeights.ankleToKnee.max) {
			return 2; 
		}

		if (height >= WaveHeights.waistHigh.min && height <= WaveHeights.waistHigh.max) {
			return 3;
		}

		if (height >= WaveHeights.headHigh.min && height <= WaveHeights.headHigh.max) {
			return 5; 
		}

		return 1;
	}

	public getPositionFromLocation(cordinates: number): GeoPosition {
		if (cordinates >= 310 || (cordinates < 50 && cordinates >= 0)) {
			return GeoPosition.N;
		}
		
		if (cordinates >= 120 && cordinates < 220) {
			return GeoPosition.S;
		}
		
		if (cordinates >= 220 && cordinates < 310) {
			return GeoPosition.W;
		}
		
		if (cordinates >= 50 && cordinates < 120) {
			return GeoPosition.E;
		}

		return GeoPosition.E;
	}

	private isWindOffShore (wavePosition: GeoPosition, windPosition: GeoPosition): boolean {
		return (
			(wavePosition === GeoPosition.N &&
			  windPosition === GeoPosition.S &&
			  this.beach.position === GeoPosition.N) ||
			(wavePosition === GeoPosition.S &&
			  windPosition === GeoPosition.N &&
			  this.beach.position === GeoPosition.S) ||
			(wavePosition === GeoPosition.E &&
			  windPosition === GeoPosition.W &&
			  this.beach.position === GeoPosition.E) ||
			(wavePosition === GeoPosition.W &&
			  windPosition === GeoPosition.E &&
			  this.beach.position === GeoPosition.W)
		  );
	}

}