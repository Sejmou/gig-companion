/**
 * This module is responsible for handling all communication with Ableton Live. Check the submodules for more info.
 *
 * A subset of the Live application state is forwarded to the clients via the WebSocket server/connection.
 * Clients can also send messages to the SvelteKit server via the same WebSocket connection to interact with Live.
 * Those messages are then translated into AbletonJS 'commands' and forwarded to Live.
 */
