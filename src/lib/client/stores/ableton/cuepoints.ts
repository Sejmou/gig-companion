import { derived, writable, type Readable } from 'svelte/store';
import type { ScopeStateSnapshot } from '$lib/types/ableton/server';
import type { ScopeAction, ScopeActionMessage } from '$lib/types/ableton/client';
import { ws } from '$lib/client/stores/websocket-connection';
import type { CuePoint } from '$lib/types/ableton/cuepoint/state';

const cuePointsInternal = writable<ScopeStateSnapshot<'cuepoints'>>([]);

export function handleCuePointsUpdate(update: ScopeStateSnapshot<'cuepoints'>): boolean {
	cuePointsInternal.set(update!);
	return true;
}

function sendCuePointAction(action: ScopeAction<'cuepoint'>) {
	const msg: ScopeActionMessage<'cuepoint'> = {
		type: 'action',
		scope: 'cuepoint',
		action
	};
	ws.send(msg);
}

export type CuePointWithActions = CuePoint & {
	jump: () => void;
};

/**
 * The cuePoints of the Ableton Live set. They have a name and a time and can be jumped to.
 */
export const cuePoints: Readable<CuePointWithActions[]> = derived(
	cuePointsInternal,
	($cuePoints) => {
		const cuePointsWithActions = $cuePoints.map((cuePoint) => {
			return {
				...cuePoint,
				jump: () => {
					sendCuePointAction({ id: cuePoint.id, name: 'jump' });
				}
			};
		});
		return cuePointsWithActions;
	}
);

cuePoints.subscribe((cuePoints) => {
	console.log('cuePoints', cuePoints);
});
