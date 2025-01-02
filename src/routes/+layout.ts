import { browser } from '$app/environment';

export const ssr = false;

if (browser) {
	import('$lib/client/stores/midi').then(({ initializeMidi }) => {
		initializeMidi();
	});
}
