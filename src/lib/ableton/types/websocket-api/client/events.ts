/**
 * 'Client Events' that are not directly related to the Ableton Live Set.
 */
export type ClientEvent = ClientReady;

/**
 * Sent by the client to the server when the client is ready to receive messages from the client.
 */
export type ClientReady = {
	type: 'clientEvent';
	name: 'ready';
};

export const isClientEvent = (unknown: unknown): unknown is ClientEvent => {
	return (
		typeof unknown === 'object' &&
		unknown !== null &&
		'type' in unknown &&
		unknown.type === 'clientEvent'
	);
};
