import { Ableton } from 'ableton-js';
import type { Device } from 'ableton-js/ns/device';
import type { Track } from 'ableton-js/ns/track';

// Log all messages to the console
const ableton = new Ableton({ logger: console });

export const test = async () => {
	await ableton.start();

	const tracks = await getTracks(ableton);
	console.log(tracks);
};

async function getTracks(ableton: Ableton) {
	const tracks = await ableton.song.get('tracks');
	const processedTracks = await Promise.all(tracks.map(processTrack));
	return processedTracks;
}

type BaseTrack = {
	id: string;
	name: string;
	devices: Device[];
	parentId?: string;
	mute: () => Promise<void>;
	unmute: () => Promise<void>;
	isMuted: () => Promise<boolean>;
	solo: () => Promise<void>;
	unsolo: () => Promise<void>;
	isSoloed: () => Promise<boolean>;
};

type MidiOrAudioTrack = BaseTrack & {
	type: 'midiOrAudio';
	arm: () => Promise<void>;
	disarm: () => Promise<void>;
	isArmed: () => Promise<boolean>;
};

type GroupTrack = BaseTrack & {
	type: 'group';
};

async function processTrack(track: Track) {
	const canBeArmed = await track.get('can_be_armed');
	const id = track.raw.id;
	const parentId = await track.get('group_track').then((t) => t?.id);
	const devices = await track.get('devices');
	const name = await track.get('name');

	const baseTrack: BaseTrack = {
		id,
		name,
		devices,
		parentId,
		mute: async () => {
			await track.set('mute', true);
		},
		unmute: async () => {
			await track.set('mute', false);
		},
		isMuted: async () => {
			return await track.get('mute');
		},
		solo: async () => {
			await track.set('solo', true);
		},
		unsolo: async () => {
			await track.set('solo', false);
		},
		isSoloed: async () => {
			const soloed = await track.get('solo');
			console.log('soloed', soloed);
			return false;
		}
	};

	if (!canBeArmed) {
		const groupTrack: GroupTrack = {
			...baseTrack,
			type: 'group'
		};
		return groupTrack;
	}

	const midiOrAudioTrack: MidiOrAudioTrack = {
		...baseTrack,
		type: 'midiOrAudio',
		arm: async () => {
			await track.set('arm', true);
		},
		disarm: async () => {
			await track.set('arm', false);
		},
		isArmed: async () => {
			return await track.get('arm');
		}
	};

	return midiOrAudioTrack;
}
