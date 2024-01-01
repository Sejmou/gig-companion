import type { SetStateUpdateMessage } from '../set/server';

export type ServerMessage = SetStateUpdateMessage | ServerEventBase;

export type StateUpdateBase = {
	type: 'stateUpdate';
};

type ServerEventBase = {
	type: 'serverEvent';
};

type ServerMessageType = ServerMessage['type'];
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

export const isServerEvent = (unknown: unknown): unknown is ServerEventBase => {
	return isServerMessage(unknown) && unknown.type == 'serverEvent';
};

export const isStateUpdate = (unknown: unknown): unknown is StateUpdateBase => {
	return isServerMessage(unknown) && unknown.type == 'stateUpdate';
};
