import { isChange } from './';

export type Action = SetAction;
export type ActionScope = Action['scope'];
export const actionScopes: ActionScope[] = ['set'] as const;

export type SetAction = StartPlayback | ContinuePlayback | StopPlayback;

export const isAction = (unknown: unknown): unknown is Action => {
	return isChange(unknown) && unknown.type == 'action' && actionScopes.includes(unknown.scope);
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
