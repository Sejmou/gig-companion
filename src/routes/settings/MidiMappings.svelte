<script lang="ts">
	import {
		midiMappings,
		addMapping,
		removeMapping,
		type ActionName,
		actionNames
	} from '$lib/client/stores/midi/action-mappings';
	import { currentMidiInput, lastMidiMessage } from '$lib/client/stores/midi';
	import { type Unsubscriber } from 'svelte/store';
	import { onDestroy } from 'svelte';

	let waitingForMIDIInput = false;
	let selectedAction: ActionName = actionNames[0]!;
	let unsubscribeLastMidiMessage: Unsubscriber | null = null;

	const handleAddMapping = (action: ActionName) => {
		if (waitingForMIDIInput) {
			waitingForMIDIInput = false;
			unsubscribeLastMidiMessage?.();
			return;
		}
		waitingForMIDIInput = true;
		const now = performance.now();
		unsubscribeLastMidiMessage = lastMidiMessage.subscribe((messageAndTimestamp) => {
			if (!messageAndTimestamp) return;
			const { message, timestamp } = messageAndTimestamp;
			console.log({ now, timestamp });
			// check if message was sent after now
			if (timestamp > now) {
				console.warn('Adding mapping', message, action);
				addMapping(message, action);
				unsubscribeLastMidiMessage?.();
				waitingForMIDIInput = false;
			}
		});
	};

	onDestroy(() => {
		unsubscribeLastMidiMessage?.();
	});
</script>

<h4 class="mt-2">Mappings</h4>
{#each Object.entries($midiMappings) as [midiEvent, action]}
	<div class="w-full border rounded-xl border-base-700 bg-base-100 p-4">
		<div class="w-full flex justify-between items-center">
			<h3>{action}</h3>
			<h5>{midiEvent}</h5>
		</div>
		<button on:click={() => removeMapping(midiEvent)}> Remove Mapping </button>
	</div>
{/each}
<div class="flex gap-2">
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Action</span>
		</div>
		<select
			disabled={!$currentMidiInput}
			bind:value={selectedAction}
			class="select select-bordered"
		>
			{#each actionNames as action}
				<option value={action} selected={selectedAction === action}>{action}</option>
			{/each}
		</select>
	</label>
	<button on:click={() => handleAddMapping(selectedAction)}
		>{!waitingForMIDIInput ? 'Add Mapping' : 'Cancel'}</button
	>
</div>
