import moment from "moment";

export class TimeUtil {

	/**
	 * @deprecated The method should not be used
	 */
	public static getUnixTimeForAFutureDay(days: number): number {
		return moment().add(days, 'days').unix();
	} 

}