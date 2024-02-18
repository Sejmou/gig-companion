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

		this.ableton.song.addListener('record_mode', (recordingNum) => {
			// experiments have shown that at runtime, the value is actually a boolean; still, to be safe, we convert it to a boolean like so:
			console.log('recordingNum', recordingNum);
			const recording = !!recordingNum;
			this.notifyObservers({ recording });
		});

		this.ableton.song.addListener('count_in_duration', (countInDurationIndex) => {
			const countInDuration = countInDurationIndexToValue(countInDurationIndex);
			this.notifyObservers({ countInDuration });
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
		} else if (action.name === 'recording') {
			await this.ableton.song.set('record_mode', action.value ? 1 : 0);
		} else if (action.name === 'countInDuration') {
			const index = countInDurationValueToIndex(action.value);
			console.warn(
				'received countInDuration action',
				action.value,
				'index would be',
				index,
				'have to ignore as it is not supported by AbletonJS yet apparently'
			);
			// crashes the app atm
			// await this.ableton.song.set('count_in_duration', countInDurationValueToIndex(action.value));
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
		const recording = (await this.ableton.song.get('record_mode')) == 1;
		const countInDuration = countInDurationIndexToValue(
			await this.ableton.song.get('count_in_duration')
		);
		const state: SetState = {
			connected: true,
			playing,
			bpm,
			timeBeats,
			timeMs,
			loopEnabled,
			loopStart,
			loopLength,
			recording,
			countInDuration
		};
		return state;
	}
}

function countInDurationIndexToValue(index: number): 0 | 1 | 2 | 4 {
	switch (index) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		case 3:
			return 4;
		default:
			throw new Error(`Invalid count-in duration index: ${index}`);
	}
}

function countInDurationValueToIndex(value: 0 | 1 | 2 | 4): number {
	switch (value) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		case 4:
			return 3;
		default:
			throw new Error(`Invalid count-in duration value: ${value}`);
	}
}

function convertToMs(smpteTime: SmpteTime): number {
	// this assumes that 0 was passed to getCurrentSmpteSongTime as argument
	// otherwise, the frames property would NOT contain milliseconds!
	const { frames: milliseconds, seconds, minutes, hours } = smpteTime;
	const total = milliseconds + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
	return total;
}
