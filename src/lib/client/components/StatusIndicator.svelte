<script lang="ts">
	export let connected = false;
</script>

<div
	class="w-4 h-4 rounded-full"
	class:bg-green-500={connected}
	class:bg-red-500={!connected}
></div>
