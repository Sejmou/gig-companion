import type { SetAction } from '$lib/ableton/types/client-actions/set';
import type { Ableton } from 'ableton-js';

export async function executeSetAction(ableton: Ableton, action: SetAction) {
	if (!ableton) return;
	if (action.name === 'continuePlayback') {
		await ableton.song.continuePlaying();
	}
	if (action.name === 'stopPlayback') {
		await ableton.song.stopPlaying();
	}
	if (action.name === 'startPlayback') {
		await ableton.song.startPlaying();
	}
}
