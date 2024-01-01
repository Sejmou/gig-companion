import type { Ableton } from 'ableton-js';

export abstract class AbletonStateManager<T extends StateAndActions> {
	constructor(
		readonly ableton: Ableton,
		updateHandler: (update: Partial<T>) => void
	) {
		this.setupListeners(updateHandler);
	}

	abstract getStateSnapshot(): Promise<T>;

	protected abstract setupListeners(updateHandler: (update: Partial<T>) => void): void;
	protected abstract stateType: string;
}

export function ExecuteIfConnected(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor
) {
	const method = descriptor.value;
	console.log('target', target);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	descriptor.value = async function (...args: any[]) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!(this as any).ableton.isConnected()) {
			console.warn(`Could not execute ${propertyKey} as Ableton Live is not connected`);
			return;
		}
		return await method.apply(this, args);
	};
}
