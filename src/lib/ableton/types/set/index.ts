import type { SetActionsMap } from './client';
import type { SetState } from './server';

export type SetStateAndActions = {
	state: SetState;
	actions: SetActionsMap;
};
