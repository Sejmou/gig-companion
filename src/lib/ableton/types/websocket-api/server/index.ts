import type { StateUpdate } from '$lib/ableton/types/websocket-api/server/state-updates';
import type { ServerEvent } from '$lib/ableton/types/websocket-api/server/events';

export type ServerMessage = StateUpdate | ServerEvent;
export type ServerMessageType = ServerMessage['type'];
const serverMessageTypes: ServerMessageType[] = ['stateUpdate', 'serverEvent'] as const;

export const isServerMessage = (unknown: unknown): unknown is ServerMessage => {
	return (
		!!unknown &&
		typeof unknown == 'object' &&
		'type' in unknown &&
		// not sure why I need the typecast
		serverMessageTypes.includes(unknown.type as ServerMessageType)
	);
};
