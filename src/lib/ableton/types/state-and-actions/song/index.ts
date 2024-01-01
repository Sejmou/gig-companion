// TODO: implement actual logic
import type { MidiOrAudioTrack } from '../track';

export type Song = {
	name: string;
	sections: Section[];
	tracks: MidiOrAudioTrack[];
};

type Section = {
	name: string;
	timestamp: number;
};
