// TODO: implement actual logic
import type { ObservableMidiOrAudioTrackState } from '../track/state';

export type Song = {
	name: string;
	sections: Section[];
	tracks: ObservableMidiOrAudioTrackState[];
};

type Section = {
	name: string;
	timestamp: number;
};
