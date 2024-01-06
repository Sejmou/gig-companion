type StartPlayback = {
	name: 'startPlayback';
};

type ContinuePlayback = {
	name: 'continuePlayback';
};

type StopPlayback = {
	name: 'stopPlayback';
};

export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;
