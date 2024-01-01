export type ClientMessage = ClientActionBase | ClientEventBase;

export type ClientActionBase = {
	type: 'action';
};

export type ClientEventBase = {
	type: 'clientEvent';
};

export type ActionsMap<T extends { name: string }> = {
	[K in T['name']]: Extract<T, { name: K }>;
};

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

export const isClientEvent = (unknown: unknown): unknown is ClientEventBase => {
	return isClientMessage(unknown) && unknown.type == 'clientEvent';
};

export const isClientAction = (unknown: unknown): unknown is ClientActionBase => {
	return isClientMessage(unknown) && unknown.type == 'action';
};
