import type { SetState } from '$lib/ableton/types/state/set';

export type SetUpdate = {
	type: 'stateUpdate';
	scope: 'set';
	update: Partial<SetState>;
};
