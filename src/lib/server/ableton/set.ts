import type { SetState } from '$lib/types/ableton/set/state';
import type { Ableton } from 'ableton-js';
import type { SetAction } from '$lib/types/ableton/set/actions';
import type {
	ScopeActionHandler,
	ScopeStateSnapshotProvider,
	ScopeUpdateObservable,
	ScopeUpdateObserver
} from '.';
import type { SmpteTime } from 'ableton-js/ns/song';
export class SetStateManager
	implements
		ScopeActionHandler<'set'>,
		ScopeStateSnapshotProvider<'set'>,
		ScopeUpdateObservable<'set'>
{
	private observers: Set<ScopeUpdateObserver<'set'>> = new Set();

	constructor(private readonly ableton: Ableton) {
		this.setupListeners();
	}

	attach(observer: ScopeUpdateObserver<'set'>): void {
		this.observers.add(observer);
	}

	private notifyObservers(update: Partial<SetState>): void {
		for (const observer of this.observers) {
			observer.notify({ scope: 'set', update });
		}
	}

	private setupListeners(): void {
		this.ableton.song.addListener('is_playing', (playing) => {
			this.notifyObservers({ playing });
		});
		this.ableton.song.addListener('tempo', (bpm) => {
			this.notifyObservers({ bpm });
		});
		// this doesn't work
		//this.ableton.song.addListener('current_smpte_song_time', (timeSmpte) => {...
		// so, we instead fetch the smpte time inside the listener for 'current_song_time' too
		this.ableton.song.addListener('current_song_time', (timeBeats) => {
			this.notifyObservers({ timeBeats });
			this.ableton.song.getCurrentSmpteSongTime(0).then((smpteTime) => {
				this.notifyObservers({ timeMs: convertToMs(smpteTime) });
			});
		});

		this.ableton.song.addListener('loop', (loopEnabled) => {
			this.notifyObservers({ loopEnabled });
		});

		this.ableton.song.addListener('loop_length', (loopLength) => {
			this.notifyObservers({ loopLength });
		});

		this.ableton.song.addListener('loop_start', (loopStart) => {
			this.notifyObservers({ loopStart });
		});
	}

	async handleAction(action: SetAction): Promise<boolean> {
		if (action.name === 'startPlayback') {
			await this.ableton.song.startPlaying();
		} else if (action.name === 'continuePlayback') {
			await this.ableton.song.continuePlaying();
		} else if (action.name === 'stopPlayback') {
			await this.ableton.song.stopPlaying();
		} else if (action.name === 'bpm') {
			await this.ableton.song.set('tempo', action.value);
		} else if (action.name === 'loopEnabled') {
			await this.ableton.song.set('loop', action.value);
		} else if (action.name === 'loopStart') {
			await this.ableton.song.set('loop_start', action.value);
		} else if (action.name === 'loopLength') {
			await this.ableton.song.set('loop_length', action.value);
		} else {
			console.warn(`Could not handle client message as action is not recognized`, action);
			return false;
		}
		return true;
	}

	async getStateSnapshot() {
		const playing = await this.ableton.song.get('is_playing');
		const bpm = await this.ableton.song.get('tempo');
		const timeBeats = await this.ableton.song.get('current_song_time');
		// passing 0 means that 'frames' property of returned SMPTETime object actually contains milliseconds!
		const timeMs = convertToMs(await this.ableton.song.getCurrentSmpteSongTime(0));
		const loopEnabled = await this.ableton.song.get('loop');
		const loopLength = await this.ableton.song.get('loop_length');
		const loopStart = await this.ableton.song.get('loop_start');
		const state: SetState = {
			connected: true,
			playing,
			bpm,
			timeBeats,
			timeMs,
			loopEnabled,
			loopStart,
			loopLength
		};
		return state;
	}
}

function convertToMs(smpteTime: SmpteTime): number {
	// this assumes that 0 was passed to getCurrentSmpteSongTime as argument
	// otherwise, the frames property would NOT contain milliseconds!
	const { frames: milliseconds, seconds, minutes, hours } = smpteTime;
	const total = milliseconds + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
	return total;
}
