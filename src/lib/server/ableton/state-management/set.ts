import type { StateAndActionsMap } from '$lib/ableton/types/state-and-actions';
import type { SetState } from '$lib/ableton/types/state-and-actions/set/state';
import { AbletonStateManager } from '.';

export class SetStateManager extends AbletonStateManager<StateAndActionsMap['set']> {
	async getStateSnapshot(): Promise<SetState> {
		const playing = await this.ableton.song.get('is_playing');
		const bpm = await this.ableton.song.get('tempo');
		const time = await this.ableton.song.get('current_song_time');
		return {
			playing,
			bpm,
			time,
			connected: true
		};
	}

	protected setupListeners(updateHandler: (update: Partial<SetState>) => void): void {
		this.ableton.song.addListener('is_playing', (playing) => {
			updateHandler({
				playing
			});
		});

		this.ableton.song.addListener('tempo', (bpm) => {
			updateHandler({
				bpm
			});
		});

		this.ableton.song.addListener('current_song_time', (time) =>
			updateHandler({
				time
			})
		);
	}
}
