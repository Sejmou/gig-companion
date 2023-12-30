import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { getWSS, onHttpServerUpgrade } from './src/lib/server/websocket';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				getWSS();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				getWSS();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			}
		}
	]
});
