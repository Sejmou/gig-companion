import { isServerMessage } from '..';
import type { SetUpdate } from './set';
import type { TrackUpdate } from './track';

export type StateUpdate = TrackUpdate | SetUpdate;
export type StateUpdateScope = StateUpdate['scope'];
const stateUpdateScopes: StateUpdateScope[] = ['track', 'set'] as const;

export const isStateUpdate = (unknown: unknown): unknown is StateUpdate => {
	return (
		isServerMessage(unknown) &&
		unknown.type == 'stateUpdate' &&
		'scope' in unknown &&
		stateUpdateScopes.includes(unknown.scope)
	);
};
