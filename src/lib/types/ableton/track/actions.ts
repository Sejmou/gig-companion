import type { TrackStateUpdate } from './state';

/**
 * Clients can update any prop that can be observed by the server.
 */
export type TrackAction = TrackStateUpdate;
