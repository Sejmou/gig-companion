import { currentSong } from './songs';
import { loopStart, loopEnd } from '../set';
import { derived } from 'svelte/store';

export const currentSongSections = derived(currentSong, ($currentSong) => {
	if ($currentSong === undefined) {
		return [];
	}
	return $currentSong.sections;
});

const SECTION_MAX_DISTANCE = 0.5;

export const loopStartSection = derived(
	[currentSongSections, loopStart],
	([$currentSongSections, $loopStart]) => {
		// find section closest to loop start
		let distToStart = Infinity;
		let closestSection = $currentSongSections[0];
		for (const section of $currentSongSections) {
			const dist = Math.abs(section.start.time - $loopStart);
			if (dist < distToStart) {
				distToStart = dist;
				closestSection = section;
			}
		}
		console.log('section closest to start:', closestSection, 'distToStart', distToStart);
		return distToStart < SECTION_MAX_DISTANCE ? closestSection : null;
	}
);

export const loopEndSection = derived(
	[currentSongSections, loopEnd],
	([$currentSongSections, $loopEnd]) => {
		// find section closest to loop end
		let distToEnd = Infinity;
		let closestSection = $currentSongSections[0];
		for (const section of $currentSongSections) {
			const dist = Math.abs(section.start.time - $loopEnd);
			if (dist < distToEnd) {
				distToEnd = dist;
				closestSection = section;
			}
		}
		console.log('section closest to end:', closestSection, 'distToEnd', distToEnd);
		return distToEnd < SECTION_MAX_DISTANCE ? closestSection : null;
	}
);
