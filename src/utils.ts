import { Ranges } from './types/cron.types';

export const getRecordKeys = <K extends Ranges[keyof Ranges]>(
	record: Partial<Record<K, boolean>>
) => {
    throw new Error("STUB");
};
