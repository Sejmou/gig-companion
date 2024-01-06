import type { TrackActionsMap } from './actions';
import type { ObservableTrackState } from './state';

export type BasicTrackStateAndActions = {
	state: ObservableTrackState;
	actions: TrackActionsMap;
};
