import type { ActionsMap } from '../../helpers';

type TrackActionBase = {
	trackId: number;
};

/**
 * Mute a track.
 */
type Mute = TrackActionBase & {
	name: 'mute';
};

/**
 * Unmute a track.
 */
type Unmute = TrackActionBase & {
	name: 'unmute';
};

/**
 * Solo a track.
 */
type Solo = TrackActionBase & {
	name: 'solo';
};

/**
 * Unsolo a track.
 */
type Unsolo = TrackActionBase & {
	name: 'unsolo';
};

/**
 * Arm a track.
 *
 * Only applicable to MIDI or audio tracks (no-op for group tracks).
 */
type Arm = TrackActionBase & {
	name: 'arm';
};

/**
 * Disarm a track.
 *
 * Only applicable to MIDI or audio tracks (no-op for group tracks).
 */
type Disarm = TrackActionBase & {
	name: 'disarm';
};

/**
 * Set the monitoring state of a track.
 *
 * Only applicable to MIDI or audio tracks (no-op for group tracks).
 */
type SetMonitoringState = TrackActionBase & {
	name: 'setMonitoringState';
	monitoringState: 'in' | 'auto' | 'off';
};

type TrackAction = Mute | Unmute | Solo | Unsolo | Arm | Disarm | SetMonitoringState;
export type TrackActionsMap = ActionsMap<TrackAction>;
