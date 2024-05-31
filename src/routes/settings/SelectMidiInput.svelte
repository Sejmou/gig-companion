<script lang="ts">
	import {
		midiInputs,
		updateMidiInput,
		resetMidiInput,
		currentMidiInputMeta,
		currentMidiInput
	} from '$lib/client/stores/midi';
	import { get } from 'svelte/store';

	function handleInputSelect(event: Event) {
		const select = event.target as HTMLSelectElement;
		const id = select.value;
		const input = get(midiInputs).find((input) => input.id === id);
		if (!input) {
			console.warn('No MIDI input found with id', id);
			resetMidiInput();
			return;
		}
		updateMidiInput(input);
	}

	$: console.log({
		$midiInputs,
		$currentMidiInput
	});
</script>

<label class="form-control w-full max-w-xs">
	<div class="label">
		<span class="label-text">MIDI Input</span>
	</div>
	<select
		value={$currentMidiInputMeta?.id}
		on:change={handleInputSelect}
		class="select select-bordered"
	>
		<option value={null} selected={!$currentMidiInputMeta} disabled>Select MIDI Input</option>
		{#if $currentMidiInputMeta && !$currentMidiInput}
			<option value={$currentMidiInputMeta.id} disabled selected
				>{$currentMidiInputMeta.name} (disconnected)</option
			>
		{/if}
		{#each $midiInputs as input}
			<option value={input.id} selected={input.id === $currentMidiInput?.id}>{input.name}</option>
		{/each}
	</select>
</label>
