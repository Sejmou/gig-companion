import type { SetState } from '../state/set';
import type { SetActionsMap } from './client/actions/set';

export type SetStateAndActions = {
	scope: 'set';
	state: SetState;
	actions: SetActionsMap;
};
