import type { SetActionsMap } from './set/client';
import type { SetState } from './set/server';

export type StateAndActionsMap = {
	set: {
		state: SetState;
		actions: SetActionsMap;
	};
};
