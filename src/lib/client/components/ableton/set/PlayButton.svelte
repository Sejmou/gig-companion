<script lang="ts">
	import { playing } from '$lib/client/stores/ableton/set';
</script>

<button
	class="btn btn-accent"
	on:click={() => {
		playing.set(!$playing);
	}}
>
	{#if $playing}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class="h-6 w-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
			/>
		</svg>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			class="h-6 w-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />
		</svg>
	{/if}
</button>
