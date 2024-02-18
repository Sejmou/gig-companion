import type { SetState } from './state';

type StartPlayback = {
	name: 'startPlayback';
};

type ContinuePlayback = {
	name: 'continuePlayback';
};

type StopPlayback = {
	name: 'stopPlayback';
};

// TODO: think about other props that could be updated by the client potentially
type UpdateableSetState = Pick<
	SetState,
	'bpm' | 'loopEnabled' | 'loopStart' | 'loopLength' | 'recording' | 'countInDuration'
>;

type SetStateUpdate = {
	[K in keyof UpdateableSetState]: { name: K; value: UpdateableSetState[K] };
}[keyof UpdateableSetState];

export type SetAction = StartPlayback | ContinuePlayback | StopPlayback | SetStateUpdate;
