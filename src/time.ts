import { DateTime, Zone } from 'luxon';

import {
	ALIASES,
	CONSTRAINTS,
	PARSE_DEFAULTS,
	PRESETS,
	RE_RANGE,
	RE_WILDCARDS,
	TIME_UNITS,
	TIME_UNITS_LEN,
	TIME_UNITS_MAP
} from './constants';
import { CronError, ExclusiveParametersError } from './errors';
import {
	CronJobParams,
	Ranges,
	TimeUnit,
	TimeUnitField
} from './types/cron.types';

type CustomZone = Zone & {
	zoneName?: string;
	fixed?: string;
};

type CustomDateTime = Omit<DateTime, 'zone'> & {
	zone: CustomZone;
};

export class CronTime {
	source: string | DateTime;
	timeZone?: string;
	utcOffset?: number;
	realDate = false;

	private second: TimeUnitField<'second'> = {};
	private minute: TimeUnitField<'minute'> = {};
	private hour: TimeUnitField<'hour'> = {};
	private dayOfMonth: TimeUnitField<'dayOfMonth'> = {};
	private month: TimeUnitField<'month'> = {};
	private dayOfWeek: TimeUnitField<'dayOfWeek'> = {};

	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: CronJobParams['timeZone'],
		utcOffset?: null
	);
	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: null,
		utcOffset?: CronJobParams['utcOffset']
	);
	constructor(
		source: CronJobParams['cronTime'],
		timeZone?: CronJobParams['timeZone'],
		utcOffset?: CronJobParams['utcOffset']
	) {
        throw new Error("STUB");
    }

	static validateCronExpression(cronExpression: string): {
		valid: boolean;
		error?: CronError;
	} {
        throw new Error("STUB");
    }

	private _getWeekDay(date: DateTime) {
		return date.weekday === 7 ? 0 : date.weekday;
	}

	/**
	 * calculate the "next" scheduled time
	 */
	sendAt(): DateTime;
	sendAt(i: number): DateTime[];
	sendAt(i?: number): DateTime | DateTime[] {
		let date =
			this.realDate && this.source instanceof DateTime
				? this.source
				: DateTime.utc();

		if (this.timeZone) {
			date = date.setZone(this.timeZone);
		}

		if (this.utcOffset !== undefined) {
			const sign = this.utcOffset < 0 ? '-' : '+';

			const offsetHours = Math.trunc(this.utcOffset / 60);
			const offsetHoursStr = String(Math.abs(offsetHours)).padStart(2, '0');

			const offsetMins = Math.abs(this.utcOffset - offsetHours * 60);
			const offsetMinsStr = String(offsetMins).padStart(2, '0');

			const utcZone = `UTC${sign}${offsetHoursStr}:${offsetMinsStr}`;

			date = date.setZone(utcZone);

			if (!date.isValid) {
				throw new CronError('ERROR: You specified an invalid UTC offset.');
			}
		}

		if (this.realDate) {
			if (DateTime.local() > date) {
				throw new CronError('WARNING: Date in past. Will never be fired.');
			}

			return date;
		}

		if (i === undefined || isNaN(i) || i < 0) {
			const nextDate = this.getNextDateFrom(date);
			// just get the next scheduled time
			return nextDate;
		} else {
			// return the next schedule times
			const dates: DateTime[] = [];
			for (; i > 0; i--) {
				date = this.getNextDateFrom(date);
				dates.push(date);
			}

			return dates;
		}
	}

	/**
	 * get the number of milliseconds in the future at which to fire our callbacks.
	 *
	 * Can return a negative value when `sendAt` took too long to execute.
	 * This is then handled in `CronJob` to execute the job immediately or skip
	 * this execution based on the `threshold` option.
	 *
	 * We could instead call DateTime.local before `sendAt` to get the current time, but
	 * then the calculated timeout would be offset by the time it takes to execute `sendAt`.
	 *
	 * As such it is better to handle negative timeouts by executing the job immediately.
	 */
	getTimeout() {
		return this.sendAt().toMillis() - DateTime.local().toMillis();
	}

	/**
	 * writes out a cron string
	 */
	toString() {
		return this.toJSON().join(' ');
	}

	/**
	 * json representation of the parsed cron syntax.
	 */
	toJSON() {
		return TIME_UNITS.map(unit => {
            throw new Error("STUB");
        });
	}

	/**
	 * get next date matching the specified cron time.
	 *
	 * Algorithm:
	 * - Start with a start date and a parsed CronTime.
	 * - Within the loop:
	 *   - If we can't find an execution time within 8 years, throw an exception.
	 *   - Find the next month to run at.
	 *   - Find the next day of the month to run at.
	 *   - Find the next day of the week to run at.
	 *   - Find the next hour to run at.
	 *   - Find the next minute to run at.
	 *   - Find the next second to run at.
	 *   - Check that the chosen time does not equal the current execution.
	 * - Return the selected date object.
	 */
	getNextDateFrom(
		start: Date | CustomDateTime,
		timeZone?: string | CustomZone
	): DateTime {
		if (start instanceof Date) {
			start = DateTime.fromJSDate(start);
		}
		if (timeZone) {
			start = start.setZone(timeZone);
		} else {
			timeZone = start.zone.zoneName ?? start.zone.fixed;
		}
		// make a clone in UTC so we can manipulate it as if there were no time zones
		let date = DateTime.fromFormat(
			`${start.year}-${start.month}-${start.day} ${start.hour}:${start.minute}:${start.second}`,
			'yyyy-M-d H:m:s',
			{
				zone: 'UTC'
			}
		);
		const firstDate = date.toMillis();
		if (!this.realDate) {
			if (date.millisecond > 0) {
				date = date.set({ millisecond: 0, second: date.second + 1 });
			}
		}

		if (!date.isValid) {
			throw new CronError('ERROR: You specified an invalid date.');
		}

		/**
		 * maximum match interval is 8 years:
		 * crontab has '* * 29 2 *' and we are on 1 March 2096:
		 * next matching time will be 29 February 2104
		 * source: https://github.com/cronie-crond/cronie/blob/0d669551680f733a4bdd6bab082a0b3d6d7f089c/src/cronnext.c#L401-L403
		 */
		const maxMatch = DateTime.now().plus({ years: 8 });
		// determine next date
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			// hard stop if the current date is after the maximum match interval
			if (date > maxMatch) {
				throw new CronError(
					`Something went wrong. No execution date was found in the next 8 years.
							Please provide the following string if you would like to help debug:
							Time Zone: ${
								timeZone?.toString() ?? '""'
							} - Cron String: ${this.source.toString()} - UTC offset: ${
								date.offset
							} - current Date: ${DateTime.local().toString()}`
				);
			}

			if (
				!(date.month in this.month) &&
				Object.keys(this.month).length !== 12
			) {
				date = date.plus({ month: 1 });
				date = date.set({ day: 1, hour: 0, minute: 0, second: 0 });

				continue;
			}

			if (
				(!(date.day in this.dayOfMonth) &&
					Object.keys(this.dayOfMonth).length !== 31 &&
					!(
						this._getWeekDay(date) in this.dayOfWeek &&
						Object.keys(this.dayOfWeek).length !== 7
					)) ||
				(!(this._getWeekDay(date) in this.dayOfWeek) &&
					Object.keys(this.dayOfWeek).length !== 7 &&
					!(
						date.day in this.dayOfMonth &&
						Object.keys(this.dayOfMonth).length !== 31
					))
			) {
				date = date.plus({ days: 1 });
				date = date.set({ hour: 0, minute: 0, second: 0 });

				continue;
			}

			if (!(date.hour in this.hour) && Object.keys(this.hour).length !== 24) {
				// only allow the hour to be 24 if a day hasn't passed yet since we started calculating the new time
				// otherwise we'll be changing the day here even though we already determined the correct day

				date = date.plus({ hour: 1 });
				date = date.set({ minute: 0, second: 0 });

				continue;
			}

			if (
				!(date.minute in this.minute) &&
				Object.keys(this.minute).length !== 60
			) {
				date = date.plus({ minute: 1 });
				date = date.set({ second: 0 });

				continue;
			}

			// respond to the previous date being checked by advancing a second
			// just like when we advance seconds normally
			if (
				date.toMillis() === firstDate ||
				(!(date.second in this.second) &&
					Object.keys(this.second).length !== 60)
			) {
				date = date.plus({ second: 1 });

				continue;
			}

			break;
		}

		// handle cases where time jumps forward due to Daylight Savings

		const expectedHour = date.hour;
		const expectedMinute = date.minute;

		date = DateTime.fromFormat(
			`${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}`,
			'yyyy-M-d H:m:s',
			{
				zone: timeZone
			}
		);
		const nonDSTReferenceDate = DateTime.fromFormat(
			`${date.year}-1-1 0:0:0`,
			'yyyy-M-d H:m:s',
			{ zone: timeZone }
		);

		// if the hour or minute is different from expected and
		// if date we assume to not be under daylight savings has a different offset
		// rewind until just after the offset
		if (
			(expectedHour !== date.hour || expectedMinute !== date.minute) &&
			nonDSTReferenceDate.offset !== date.offset
		) {
			while (date.minus({ minute: 1 }).offset !== nonDSTReferenceDate.offset) {
				date = date.minus({ minute: 1 });
			}
			return date;
		}

		// handle cases where time jumps back due to Daylight Savings (ambiguous times)

		// daylight savings jumps are either 60 or 30 minutes
		const hourTestDate = date.minus({ hour: 1 });
		const twoHourTestDate = date.minus({ hour: 2 });
		// if the previous hour is the same as this hour we are in an ambiguous time
		// jump back to the earlier hour as long as it's not in the past
		if (
			(hourTestDate.hour === date.hour ||
				twoHourTestDate.hour === hourTestDate.hour) &&
			hourTestDate > start
		) {
			date = hourTestDate;
		}
		// similar for half hour jumps
		const halfHourTestDate = date.minus({ minute: 30 });
		if (
			(halfHourTestDate.minute === date.minute ||
				hourTestDate.minute === halfHourTestDate.minute) &&
			halfHourTestDate > start
		) {
			date = halfHourTestDate;
		}

		return date;
	}

	/**
	 * wildcard, or all params in array (for to string)
	 */
	private _wcOrAll(unit: TimeUnit) {
		if (this._hasAll(unit)) {
			return '*';
		}

		const all = [];
		for (const time in this[unit]) {
			all.push(time);
		}

		return all.join(',');
	}

	private _hasAll(unit: TimeUnit) {
		const constraints = CONSTRAINTS[unit];
		const low = constraints[0];
		const high =
			unit === TIME_UNITS_MAP.DAY_OF_WEEK ? constraints[1] - 1 : constraints[1];

		for (let i = low, n = high; i < n; i++) {
			if (!(i in this[unit])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * parse the cron syntax into something useful for selecting the next execution time.
	 *
	 * Algorithm:
	 * - Replace preset
	 * - Replace aliases in the source.
	 * - Trim string and split for processing.
	 * - Loop over split options (ms -> month):
	 *   - Get the value (or default) in the current position.
	 *   - Parse the value.
	 */
	private _parse(source: string) {
        throw new Error("STUB");
    }

	/**
	 * parse individual field from the cron syntax provided.
	 *
	 * Algorithm:
	 * - Split field by commas and check for wildcards to ensure proper user.
	 * - Replace wildcard values with <low>-<high> boundaries.
	 * - Split field by commas and then iterate over ranges inside field.
	 *   - If range matches pattern then map over matches using replace (to parse the range by the regex pattern)
	 *   - Starting with the lower bounds of the range iterate by step up to the upper bounds and toggle the CronTime field value flag on.
	 */

	private _parseField(value: string, unit: TimeUnit) {
        throw new Error("STUB");
    }
}
