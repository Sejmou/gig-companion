<script lang="ts">
	import 'iconify-icon';
	import { recording } from '$lib/client/stores/ableton/set';
</script>

<button
	class="btn"
	class:btn-error={$recording}
	on:click={() => {
		recording.set(!$recording);
	}}
>
	<iconify-icon icon="mdi:record" width="24" height="24" />
</button>
