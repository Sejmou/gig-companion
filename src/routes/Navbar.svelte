<script lang="ts">
	import { page } from '$app/stores';
	import StatusIndicator from '$lib/client/components/StatusIndicator.svelte';
	import { connected as abletonConnected } from '$lib/client/stores/ableton/set';
	import { ws } from '$lib/client/stores/websocket-connection';
	import { derived } from 'svelte/store';
	const { serverReady, connectedToServer } = ws;
	const connected = derived(
		[abletonConnected, connectedToServer, serverReady],
		([$abletonConnected, $connectedToServer, $serverReady]) =>
			$abletonConnected && $connectedToServer && $serverReady
	);
	let connectionManagementDialog: HTMLDialogElement;
	const openDialog = () => {
		connectionManagementDialog.showModal();
	};
</script>

<div class="navbar bg-base-100">
	<div>
		<div class="dropdown">
			<label tabindex="0" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/></svg
				>
			</label>
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li>
					<a
						href="/songs"
						class={$page.url.pathname == '/songs' ? 'text-black dark:text-white' : 'text-gray-500'}
						>Songs</a
					>
				</li>
				<li>
					<a
						href="/settings"
						class={$page.url.pathname == '/settings'
							? 'text-black dark:text-white'
							: 'text-gray-500'}>Settings</a
					>
				</li>
				<!-- Add more subpages here as needed (make sure to add in other list as well!) -->
				<!-- On mobile, show the connection state here -->
				<li>
					<div class="flex items-center" on:click={openDialog}>
						<span class="mr-auto">Connection </span>
						<StatusIndicator connected={$connected} />
					</div>
				</li>
			</ul>
		</div>
		<a href="/" class="btn btn-ghost normal-case text-xl">Gig Companion</a>
	</div>
	<div class="hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li>
				<a
					href="/songs"
					class={$page.url.pathname == '/songs' ? 'text-black dark:text-white' : 'text-gray-500'}
					>Songs</a
				>
			</li>
			<li>
				<a
					href="/settings"
					class={$page.url.pathname == '/settings' ? 'text-black dark:text-white' : 'text-gray-500'}
					>Settings</a
				>
			</li>
			<!-- Add more subpages here as needed (make sure to add in other list as well!) -->
		</ul>
		<div class="hidden lg:flex absolute right-2">
			<div class="btn btn-neutral flex gap-2 items-center" on:click={openDialog}>
				<span>Connection Status</span>
				<StatusIndicator connected={$connected} />
			</div>
		</div>
	</div>
</div>

<dialog bind:this={connectionManagementDialog} class="modal">
	<div class="modal-box">
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
		</form>
		<h3 class="mb-2">Connection</h3>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2 w-full">
				<div class="flex w-full justify-between">
					<span class="text-sm">Ableton Live</span>
					<StatusIndicator connected={$abletonConnected} />
				</div>
				<div class="flex w-full justify-between">
					<span class="text-sm">WebSocket Server</span>
					<StatusIndicator connected={$connectedToServer && $serverReady} />
				</div>
			</div>
			<button class="btn btn-warning" on:click={ws.reset}>Reset connection</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
