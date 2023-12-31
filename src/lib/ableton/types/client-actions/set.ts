export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;

type StartPlayback = {
	type: 'action';
	scope: 'set';
	name: 'startPlayback';
};

type ContinuePlayback = {
	type: 'action';
	scope: 'set';
	name: 'continuePlayback';
};

type StopPlayback = {
	type: 'action';
	scope: 'set';
	name: 'stopPlayback';
};
