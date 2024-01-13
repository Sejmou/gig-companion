<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/client/components/ui/Navbar/Navbar.svelte';
	import Footer from '$lib/client/components/ui/Footer.svelte';
	import 'iconify-icon';
</script>

<div class="flex flex-col min-h-[100vh] bg-base-200">
	<Navbar />
	<main class="flex-1 flex flex-col p-4 w-full max-w-screen-lg mx-auto my-auto box-border">
		<slot />
	</main>
	<Footer />
</div>
