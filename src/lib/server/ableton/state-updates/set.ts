import type { SetState } from '$lib/ableton/types/state/set';
import { AbletonStateManager, ExecuteIfConnected } from '.';

export class SetStateManager extends AbletonStateManager<SetState> {
	protected stateType = 'set';

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

	@ExecuteIfConnected
	async setTempo(bpm: number) {
		await this.ableton.song.set('tempo', bpm);
	}

	@ExecuteIfConnected
	async setTime(time: number) {
		await this.ableton.song.set('current_song_time', time);
	}

	@ExecuteIfConnected
	async startPlayback() {
		await this.ableton.song.startPlaying();
	}

	@ExecuteIfConnected
	async stopPlayback() {
		await this.ableton.song.stopPlaying();
	}

	@ExecuteIfConnected
	async continuePlayback() {
		await this.ableton.song.continuePlaying();
	}
}
