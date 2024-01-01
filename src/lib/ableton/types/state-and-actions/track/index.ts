import type { TrackActionsMap } from './actions';
import type { Track } from './state';

export type BasicTrackStateAndActions = {
	state: Track;
	actions: TrackActionsMap;
};
