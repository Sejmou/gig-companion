import type { SetState } from '$lib/types/ableton/set/state';
import type { Ableton } from 'ableton-js';
import type { SetAction } from '$lib/types/ableton/set/actions';
export class SetStateManager {
	constructor(
		private readonly ableton: Ableton,
		private readonly onUpdate: (update: Partial<SetState>) => void
	) {
		this.setupListeners();
	}

	private setupListeners(): void {
		this.ableton.song.addListener('is_playing', (playing) => {
			this.onUpdate({ playing });
		});
		this.ableton.song.addListener('tempo', (bpm) => {
			this.onUpdate({ bpm });
		});
		this.ableton.song.addListener('current_song_time', (time) => {
			this.onUpdate({ time });
		});
	}

	async handleAction(action: SetAction): Promise<boolean> {
		if (action.name === 'startPlayback') {
			await this.ableton.song.startPlaying();
		} else if (action.name === 'continuePlayback') {
			await this.ableton.song.continuePlaying();
		} else if (action.name === 'stopPlayback') {
			await this.ableton.song.stopPlaying();
		} else {
			console.warn(`Could not handle client message as action is not recognized`, action);
			return false;
		}
		return true;
	}

	async getLatestState() {
		const playing = await this.ableton.song.get('is_playing');
		const bpm = await this.ableton.song.get('tempo');
		const time = await this.ableton.song.get('current_song_time');
		const state: SetState = {
			connected: true,
			playing,
			bpm,
			time
		};
		return state;
	}
}
