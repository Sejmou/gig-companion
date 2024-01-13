import { derived, writable } from 'svelte/store';
import type { ScopeStateSnapshot } from '$lib/types/ableton/server';

const cuePointsInternal = writable<ScopeStateSnapshot<'cuepoints'>>([]);

export function handleCuePointsUpdate(update: ScopeStateSnapshot<'cuepoints'>): boolean {
	cuePointsInternal.set(update!);
	return true;
}

/**
 * The cuePoints of the Ableton Live set. They have a name and a time and can be jumped to.
 */
export const cuePoints = derived(cuePointsInternal, ($cuePoints) => {
	return $cuePoints;
});
