import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { createGlobalInstances, onHttpServerUpgrade } from './src/lib/server/websocket';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				createGlobalInstances();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				createGlobalInstances();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			}
		}
	]
});
