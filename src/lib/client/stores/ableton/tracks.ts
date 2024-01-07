import { derived, writable } from 'svelte/store';
import type { ScopeStateSnapshot } from '$lib/types/ableton/server';

const rootTracksInternal = writable<ScopeStateSnapshot<'tracks'>>([]);

export function handleTracksUpdate(update: ScopeStateSnapshot<'tracks'>) {
	rootTracksInternal.set(update!);
}

/**
 * The root tracks of the Ableton Live set. Any track in the returned array
 * can be a group track, which means it can contain other tracks, or a regular MIDI/Audio track.
 */
export const rootTracks = derived(rootTracksInternal, ($tracks) => {
	return $tracks;
});
