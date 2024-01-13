<script lang="ts">
	import { songs } from '$lib/client/stores/ableton/derived/songs';
</script>

<div class="flex flex-col gap-2">
	{#each $songs as song}
		<div class="w-full border rounded-xl border-base-700 bg-base-100 p-4">
			<div class="w-full flex justify-between items-center">
				<h3>{song.name}</h3>
			</div>
			{#if song.sections.length > 0}
				<div
					tabindex="0"
					class="collapse collapse-arrow border border-base-700 bg-base-100 mt-4"
					on:click={(ev) => ev.stopPropagation()}
				>
					<input type="checkbox" />
					<div class="collapse-title text-xl font-medium">{song.sections.length} Sections</div>
					<div class="collapse-content">
						<ul>
							{#each song.sections as section}
								<li>{section.name}</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
