import { Beach, BeachPosition } from "@src/models/beach";

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
	
	public getRatingBasedOnWindAndWavePositions(wavePosition: BeachPosition, windPosition: BeachPosition): number {
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

	public getPositionFromLocation(cordinates: number): BeachPosition {
		if (cordinates >= 310 || (cordinates < 50 && cordinates >= 0)) {
			return BeachPosition.N;
		}
		
		if (cordinates >= 120 && cordinates < 220) {
			return BeachPosition.S;
		}
		
		if (cordinates >= 220 && cordinates < 310) {
			return BeachPosition.W;
		}
		
		if (cordinates >= 50 && cordinates < 120) {
			return BeachPosition.E;
		}

		return BeachPosition.E;
	}

	private isWindOffShore (wavePosition: BeachPosition, windPosition: BeachPosition): boolean {
		return (
			(wavePosition === BeachPosition.N &&
			  windPosition === BeachPosition.S &&
			  this.beach.position === BeachPosition.N) ||
			(wavePosition === BeachPosition.S &&
			  windPosition === BeachPosition.N &&
			  this.beach.position === BeachPosition.S) ||
			(wavePosition === BeachPosition.E &&
			  windPosition === BeachPosition.W &&
			  this.beach.position === BeachPosition.E) ||
			(wavePosition === BeachPosition.W &&
			  windPosition === BeachPosition.E &&
			  this.beach.position === BeachPosition.W)
		  );
	}

}