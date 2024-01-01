export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;

export type SetActionBase = {
	type: 'action';
	scope: 'set';
};

type StartPlayback = SetActionBase & {
	name: 'startPlayback';
};

type ContinuePlayback = SetActionBase & {
	name: 'continuePlayback';
};

type StopPlayback = SetActionBase & {
	name: 'stopPlayback';
};

export type SetActionsMap = {
	[K in SetAction['name']]: Extract<SetAction, { name: K }>;
};
