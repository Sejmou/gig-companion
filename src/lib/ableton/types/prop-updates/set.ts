import type { SetState } from '../state/set';

export type SetUpdate = {
	type: 'propUpdate';
	scope: 'set';
	update: Partial<SetState>;
};
