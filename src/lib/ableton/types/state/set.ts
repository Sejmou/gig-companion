/**
 * The current state of Ableton Live's set.
 * This includes information about the current song, the current playback state, the current time, etc.
 * This is the only state that is not scoped to a specific track.
 */

export type SetState = {
	/**
	 * Whether the connection to Ableton Live is established.
	 * If this is false, no other state is guaranteed to be up to date.
	 */
	connected: boolean;
	/**
	 * Whether Ableton Live is currently playing.
	 */
	playing: boolean;
	/**
	 * The current tempo in beats per minute.
	 */
	bpm: number;
	/**
	 * The current time in seconds.
	 */
	time: number;
};
