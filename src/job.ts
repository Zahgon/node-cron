import { spawn } from 'child_process';
import { CronError, ExclusiveParametersError } from './errors';
import { CronTime } from './time';
import {
	CronCallback,
	CronCommand,
	CronContext,
	CronJobParams,
	CronOnCompleteCallback,
	CronOnCompleteCommand,
	WithOnComplete
} from './types/cron.types';

export class CronJob<OC extends CronOnCompleteCommand | null = null, C = null> {
	cronTime: CronTime;
	unrefTimeout = false;
	lastExecution: Date | null = null;
	runOnce = false;
	context: CronContext<C>;
	onComplete?: WithOnComplete<OC> extends true
		? CronOnCompleteCallback
		: undefined;
	waitForCompletion = false;
	errorHandler?: CronJobParams<OC, C>['errorHandler'];
	name?: string; // optional job name for identification
	threshold = 250; // default threshold in ms

	private _isActive = false;
	private _isCallbackRunning = false;
	private _timeout?: NodeJS.Timeout;
	private _callbacks: CronCallback<C, WithOnComplete<OC>>[] = [];

	get isActive() {
        throw new Error("STUB");
    }

	get isCallbackRunning() {
        throw new Error("STUB");
    }

	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: CronJobParams<OC, C>['timeZone'],
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: null,
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler'],
		name?: CronJobParams<OC, C>['name'],
		threshold?: CronJobParams<OC, C>['threshold']
	);
	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: null,
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: CronJobParams<OC, C>['utcOffset'],
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler'],
		name?: CronJobParams<OC, C>['name'],
		threshold?: CronJobParams<OC, C>['threshold']
	);
	constructor(
		cronTime: CronJobParams<OC, C>['cronTime'],
		onTick: CronJobParams<OC, C>['onTick'],
		onComplete?: CronJobParams<OC, C>['onComplete'],
		start?: CronJobParams<OC, C>['start'],
		timeZone?: CronJobParams<OC, C>['timeZone'],
		context?: CronJobParams<OC, C>['context'],
		runOnInit?: CronJobParams<OC, C>['runOnInit'],
		utcOffset?: CronJobParams<OC, C>['utcOffset'],
		unrefTimeout?: CronJobParams<OC, C>['unrefTimeout'],
		waitForCompletion?: CronJobParams<OC, C>['waitForCompletion'],
		errorHandler?: CronJobParams<OC, C>['errorHandler'],
		name?: CronJobParams<OC, C>['name'],
		threshold?: CronJobParams<OC, C>['threshold']
	) {
        throw new Error("STUB");
    }

	static from<OC extends CronOnCompleteCommand | null = null, C = null>(
		params: CronJobParams<OC, C>
	) {
        throw new Error("STUB");
    }

	private _fnWrap(cmd: CronCommand<C, boolean>): CronCallback<C, boolean> {
        throw new Error("STUB");
    }

	addCallback(callback: CronCallback<C, WithOnComplete<OC>>) {
        throw new Error("STUB");
    }

	setTime(time: CronTime) {
        throw new Error("STUB");
    }

	nextDate() {
        throw new Error("STUB");
    }

	async fireOnTick() {
        throw new Error("STUB");
    }

	nextDates(i?: number) {
        throw new Error("STUB");
    }

	start() {
        throw new Error("STUB");
    }

	lastDate() {
        throw new Error("STUB");
    }

	private async _executeOnComplete() {
        throw new Error("STUB");
    }

	private async _waitForJobCompletion() {
        throw new Error("STUB");
    }

	/**
	 * stop the cronjob.
	 */
	stop() {
        throw new Error("STUB");
    }
}
