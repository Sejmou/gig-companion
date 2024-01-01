import type { ClientAction } from '$lib/ableton/types/websocket-api/client/actions';
import type { ClientEvent } from '$lib/ableton/types/websocket-api/client/events';

export type ClientMessage = ClientAction | ClientEvent;
export type ClientMessageType = ClientMessage['type'];
const clientMessageTypes: ClientMessageType[] = ['action', 'clientEvent'] as const;

export const isClientMessage = (unknown: unknown): unknown is ClientMessage => {
	return (
		!!unknown &&
		typeof unknown == 'object' &&
		'type' in unknown &&
		// not sure why I need the typecast
		clientMessageTypes.includes(unknown.type as ClientMessageType)
	);
};
