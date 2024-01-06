/**
 * 'Serverside Events' that are not directly related to the Ableton Live Set.
 */
export type ServerEvent = ServerReady;

/**
 * Sent by the server to the client when the server is ready to receive messages from the client.
 */
export type ServerReady = {
	type: 'serverEvent';
	name: 'ready';
};

export const isServerEvent = (unknown: unknown): unknown is ServerEvent => {
	return (
		typeof unknown === 'object' &&
		unknown !== null &&
		'type' in unknown &&
		unknown.type === 'serverEvent'
	);
};
