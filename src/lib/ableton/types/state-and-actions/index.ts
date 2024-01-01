import type { SetActionsMap } from './set/actions';
import type { SetState } from './set/state';

export type Scope = keyof StateAndActionsMap;

export type StateAndActionsMap = {
	set: {
		state: SetState;
		actions: SetActionsMap;
	};
};

export type StateUpdateMessage = {
	type: 'stateUpdate';
	scope: Scope;
	update: Partial<StateAndActionsMap[Scope]['state']>;
};
