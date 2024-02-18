<script lang="ts">
	import BackingTracks from '$lib/client/components/ableton/backing-tracks/BackingTracks.svelte';
	import Sounds from '$lib/client/components/ableton/sounds/Sounds.svelte';
	import SongPlayback from './SongPlayback.svelte';
	import LoopSettings from '$lib/client/components/ableton/song/LoopSettings.svelte';
	import { loopEnabled } from '$lib/client/stores/ableton/set';
</script>

<svelte:head>
	<title>Gig Companion</title>
</svelte:head>

<main class="flex-1 flex flex-col w-full gap-2 max-w-screen-lg mx-auto">
	<div class="flex w-full flex-col gap-4">
		<SongPlayback />
		{#if $loopEnabled}
			<div class="card bg-base-100">
				<div class="card-body">
					<h2 class="card-title">Loop Settings</h2>
					<LoopSettings />
				</div>
			</div>
		{/if}
		<div class="card bg-base-100">
			<div class="card-body">
				<h2 class="card-title">Sounds</h2>
				<Sounds />
			</div>
		</div>
		<div class="card bg-base-100">
			<div class="card-body">
				<h2 class="card-title">Backing Tracks</h2>
				<BackingTracks />
			</div>
		</div>
	</div>
</main>
