import type { SetActionsMap } from './actions';
import type { SetState } from './state';

export type SetStateAndActions = {
	state: SetState;
	actions: SetActionsMap;
};
