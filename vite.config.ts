import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { getWebSocketServer, onHttpServerUpgrade } from './src/lib/server/websocket-server';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				getWebSocketServer();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				getWebSocketServer();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			}
		}
	]
});
