/**
 * The current 'global' state of the Ableton Live set.
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
	 * The current time in beats.
	 */
	timeBeats: number;
	/**
	 * The current time in milliseconds.
	 */
	timeMs: number;
	/**
	 * Whether the loop is currently enabled.
	 */
	loopEnabled: boolean;
	/**
	 * Arrangement loop start in beats.
	 */
	loopStart: number;
	/**
	 * Arrangement loop length in beats.
	 */
	loopLength: number;
};
