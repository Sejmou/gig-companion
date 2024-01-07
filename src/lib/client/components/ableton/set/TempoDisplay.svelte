<script lang="ts">
	import { bpm } from '$lib/client/stores/ableton/set';
</script>

<div class="flex flex-col">
	<h5>Tempo</h5>
	<span>{$bpm.toFixed(1)} BPM</span>
</div>
