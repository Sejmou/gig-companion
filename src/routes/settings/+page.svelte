<script lang="ts">
	import PlayModeSelect from './PlayModeSelect.svelte';
	import SelectMidiInput from './SelectMidiInput.svelte';
</script>

<div class="flex flex-col gap-2">
	<div>
		<h3>Playback</h3>
		<PlayModeSelect />
	</div>
	<div>
		<h3>MIDI</h3>
		<SelectMidiInput />
	</div>
</div>
