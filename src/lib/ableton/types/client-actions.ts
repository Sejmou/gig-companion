import { isChange } from '.';

export type ClientAction = SetAction;
export type ActionScope = ClientAction['scope'];
export const actionScopes: ActionScope[] = ['set'] as const;

export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;

export const isAction = (unknown: unknown): unknown is ClientAction => {
	return (
		isChange(unknown) &&
		unknown.type == 'action' &&
		'scope' in unknown &&
		actionScopes.includes(unknown.scope)
	);
};

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
