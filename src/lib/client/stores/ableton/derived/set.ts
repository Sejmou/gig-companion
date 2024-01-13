// import { songs } from './songs';
// import { derived } from 'svelte/store';

// this doesn't work as cuepoint time is in beats, not ms
// there also doesn't seem to be a global set duration property in the Live Object Model :/
// TODO: fix
// export const duration = derived(songs, ($songs) => {
// 	const lastSong = $songs.at(-1);
// 	if (!lastSong) return undefined;
// 	const lastSection = lastSong.sections.at(-1);
// 	if (!lastSection) return undefined;
// 	const lastSectionEnd = lastSection.end;
// 	if (!(lastSectionEnd.name === '[End]')) return undefined;
// 	return lastSectionEnd.time;
// });
