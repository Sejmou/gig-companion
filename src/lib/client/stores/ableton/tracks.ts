import { derived, writable } from 'svelte/store';
import type { ScopeStateSnapshot } from '$lib/types/ableton/server';

const tracksInternal = writable<ScopeStateSnapshot<'tracks'>>([]);

export function handleTracksUpdate(update: ScopeStateSnapshot<'tracks'>) {
	tracksInternal.set(update!);
}

export const tracks = derived(tracksInternal, ($tracks) => {
	return $tracks;
});
