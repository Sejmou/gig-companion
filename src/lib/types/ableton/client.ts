import type { CuePointAction } from './cuepoint/actions';
import type { SetAction } from './set/actions';
import type { TrackAction } from './track/actions';

type ClientActionScopes = {
	set: SetAction;
	track: TrackAction;
	cuepoint: CuePointAction;
};
export type ClientActionScope = keyof ClientActionScopes;
export type ScopeAction<T extends ClientActionScope> = ClientActionScopes[T];

type ScopeActionMessages = {
	[T in ClientActionScope]: ScopeActionMessage<T>;
};
export type ScopeActionMessage<T extends ClientActionScope> = {
	type: 'action';
	scope: T;
	action: ClientActionScopes[T];
};
export type ClientActionMessage = ScopeActionMessages[ClientActionScope];
