import { cuePoints, type CuePointWithActions } from '../cuepoints';
import { derived, get } from 'svelte/store';
import { timeBeats } from '../set';

export const songs = derived(cuePoints, ($cuePoints) => {
	const songs: Song[] = [];
	let currentSong: Song | undefined;
	let endReached = false;
	for (let i = 0; i < $cuePoints.length; i++) {
		if (endReached) {
			console.warn('Found song cue point after end cue point. Ignoring it.');
			continue;
		}
		const cuePoint = $cuePoints[i]!;
		const { level, name } = processCuePointName(cuePoint.name);
		if (level === 0) {
			// TODO: consider creating end cue point automatically if it doesn't exist OR handle missing end cue point in some smart way
			if (name === '[End]') {
				endReached = true;
				// found end cue point!
				if (currentSong) {
					currentSong.end = cuePoint;
					const lastSection = currentSong.sections.at(-1);
					if (lastSection) {
						// set end cue point of last section to this cue point
						lastSection.end = cuePoint;
					} else {
						console.log(currentSong.name, 'has no sections');
					}
				}
				currentSong = undefined;
				continue;
			}
			// found song cue point!
			if (currentSong) {
				currentSong.end = cuePoint;
				const lastSection = currentSong.sections.at(-1);
				if (lastSection) {
					// set end cue point of last section to this cue point
					lastSection.end = cuePoint;
				} else {
					console.log(currentSong.name, 'has no sections');
				}
			}
			currentSong = {
				name,
				start: cuePoint,
				end: cuePoint,
				sections: []
			};
			songs.push(currentSong);
		} else if (level >= 1) {
			// found section cue point!
			if (level > 1) {
				console.warn(
					`Cue point '${cuePoint.name}' has level > 1 (i.e. more than 1 '#' in name). It will be ignored.`
				);
				continue;
			}
			if (!currentSong) {
				console.warn('Found section without preceding song cue point');
				continue;
			}
			const lastSection = currentSong.sections.at(-1);
			if (lastSection?.end) {
				// set end cue point of previous section to this cue point
				lastSection.end = cuePoint;
			}
			// add new section
			currentSong.sections.push({
				name,
				start: cuePoint,
				end: cuePoint
			});
		}
	}

	return songs;
});

export const currentSong = derived([songs, timeBeats], ([$songs, $timeBeats]) => {
	return $songs.find((song) => $timeBeats >= song.start.time && $timeBeats < song.end.time);
});
export const currentSongName = derived(currentSong, ($currentSong) => $currentSong?.name);

export const nextSong = derived([songs, currentSong], ([$songs, $currentSong]) => {
	if (!$currentSong) {
		return;
	}
	const currentIdx = $songs.indexOf($currentSong);
	if (currentIdx === $songs.length - 1) {
		return;
	}
	return $songs[currentIdx + 1];
});

export const prevSong = derived([songs, currentSong], ([$songs, $currentSong]) => {
	if (!$currentSong) {
		return;
	}
	const currentIdx = $songs.indexOf($currentSong);
	if (currentIdx === 0) {
		return;
	}
	return $songs[currentIdx - 1];
});

export const setCurrentSongIdx = (idx: number) => {
	const currentSongs = get(songs);
	if (idx < 0 || idx >= currentSongs.length) {
		console.warn('Invalid song index:', idx);
		return;
	}
	const song = currentSongs[idx];
	song?.start?.jump();
};

function processCuePointName(name: string) {
	const result = {
		level: 0,
		name
	};
	for (let i = 0; i < name.length; i++) {
		if (name[i] !== '#') {
			result.level = i;
			result.name = name.substring(i);
			break;
		}
	}
	return result;
}

export type Song = {
	name: string;
	start: CuePointWithActions;
	end: CuePointWithActions;
	sections: SongSection[];
};

export type SongSection = {
	name: string;
	start: CuePointWithActions;
	end: CuePointWithActions;
};
