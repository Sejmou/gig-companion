import type { Ableton } from 'ableton-js';
import type { CuePoint as AbletonCuePoint } from 'ableton-js/ns/cue-point';
import type {
	ScopeActionHandler,
	ScopeStateSnapshotProvider,
	ScopeUpdateObservable,
	ScopeUpdateObserver
} from '..';
import type { CuePoint, CuePointUpdate } from '$lib/types/ableton/cuepoint/state';
import type { CuePointAction } from '$lib/types/ableton/cuepoint/actions';
import type { ScopeStateUpdatePayload } from '$lib/types/ableton/server';

type ServerCuePoint = CuePoint & {
	raw: AbletonCuePoint;
};

export class CuePointStateManager
	implements
		ScopeStateSnapshotProvider<'cuepoints'>,
		ScopeActionHandler<'cuepoint'>,
		ScopeUpdateObservable<'cuepoint'>
{
	private cuePointsMap: Map<string, ServerCuePoint> = new Map();
	private observers: Set<ScopeUpdateObserver<'cuepoint'>> = new Set();

	constructor(private readonly ableton: Ableton) {
		this.initialize();
	}

	private async initialize(): Promise<void> {
		const cuePoints = await this.ableton.song.get('cue_points');
		for (const cuePoint of cuePoints) {
			const id = cuePoint.raw.id;
			cuePoint.addListener('name', (name) => {
				this.sendUpdate({
					id,
					name
				});
			});
			cuePoint.addListener('time', (time) => {
				this.sendUpdate({
					id,
					time
				});
			});

			const name = await cuePoint.get('name');
			const time = await cuePoint.get('time');
			this.cuePointsMap.set(id, {
				id,
				name,
				time,
				raw: cuePoint
			});
		}
	}

	private sendUpdate(update: CuePointUpdate): void {
		this.notifyObservers({
			scope: 'cuepoint',
			update
		});
	}

	private notifyObservers(update: ScopeStateUpdatePayload<'cuepoint'>): void {
		for (const observer of this.observers) {
			observer.notify(update);
		}
	}

	async getStateSnapshot(): Promise<CuePoint[]> {
		const cuePoints = Array.from(this.cuePointsMap.values()).sort((a, b) => a.time - b.time);
		// cannot send the raw cuepoint objects (`raw` property of every object in cuePoints) to the client as they are not JSON serializable -> create new objects without them
		return cuePoints.map(({ id, name, time }) => ({
			id,
			name,
			time
		}));
	}

	async handleAction(action: CuePointAction): Promise<boolean> {
		const id = action.id;
		const cuepoint = this.cuePointsMap.get(id);
		if (!cuepoint) {
			console.warn(`Could not find cuepoint with ID ${id} - not updating`);
			return false;
		}
		if (action.name === 'jump') {
			await cuepoint.raw.jump();
			return true;
		}
		return false;
	}
	attach(observer: ScopeUpdateObserver<'cuepoint'>): void {
		this.observers.add(observer);
	}
}
