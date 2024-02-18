<script lang="ts">
	import { midiInputs, midiInputId, midiInput } from '$lib/client/stores/midi';

	function handleInputSelect(event: Event) {
		const select = event.target as HTMLSelectElement;
		const id = select.value;
		midiInputId.set(id);
	}

	$: console.log({
		$midiInputs,
		$midiInputId,
		$midiInput
	});
</script>

<label class="form-control w-full max-w-xs">
	<div class="label">
		<span class="label-text">MIDI Input</span>
	</div>
	<select value={$midiInputId} on:change={handleInputSelect} class="select select-bordered">
		<option value={null}>Select MIDI Input</option>
		{#each $midiInputs as input}
			<option value={input.id} selected={input.id === $midiInputId}>{input.name}</option>
		{/each}
	</select>
</label>
