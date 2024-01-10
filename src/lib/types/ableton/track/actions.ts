import type { ObservableTrackStateUpdate } from './state';

/**
 * Clients can update any prop that can be observed by the server.
 */
export type TrackAction = ObservableTrackStateUpdate;
