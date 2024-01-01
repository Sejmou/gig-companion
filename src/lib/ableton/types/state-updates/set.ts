import type { SetState } from '../state/set';

export type SetUpdate = {
	type: 'stateUpdate';
	scope: 'set';
	update: Partial<SetState>;
};
