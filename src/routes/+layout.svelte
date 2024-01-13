<script lang="ts">
	import '../app.css';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import { page } from '$app/stores';
	import 'iconify-icon';

	function toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt: string) {
			return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
		});
	}

	function prettifyComponentName(component: string) {
		// TODO: remove the digit replacement once I have a better way to handle routing (NOT using S3 folder paths lol)
		return toTitleCase(component.replaceAll('_', ' ').replace(/\d/g, ''));
	}

	let pathComponents: string[] = [];
	page.subscribe((value) => {
		pathComponents = value.url.pathname.split('/').filter((component) => component !== '');
	});
</script>

<div class="flex flex-col min-h-[100vh] bg-base-200">
	<Navbar />
	<main class="flex-1 flex flex-col p-4 w-full max-w-screen-lg mx-auto my-auto box-border">
		<slot />
	</main>
	<Footer />
</div>
