import type { ActionsMap, ClientActionBase } from '../message-base/client';

type StartPlayback = {
	name: 'startPlayback';
};

type ContinuePlayback = {
	name: 'continuePlayback';
};

type StopPlayback = {
	name: 'stopPlayback';
};

type StartPlaybackMessage = ClientActionBase & StartPlayback;
type ContinuePlaybackMessage = ClientActionBase & ContinuePlayback;
type StopPlaybackMessage = ClientActionBase & StopPlayback;

export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;
export type SetActionMessage = StartPlaybackMessage | ContinuePlaybackMessage | StopPlaybackMessage;
export type SetActionsMap = ActionsMap<SetAction>;
