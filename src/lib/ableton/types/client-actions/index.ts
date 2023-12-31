import { isChange } from '..';
import type { SetAction } from './set';

export type ClientAction = SetAction;
export type ActionScope = ClientAction['scope'];
export const actionScopes: ActionScope[] = ['set'] as const;

export const isAction = (unknown: unknown): unknown is ClientAction => {
	return (
		isChange(unknown) &&
		unknown.type == 'action' &&
		'scope' in unknown &&
		actionScopes.includes(unknown.scope)
	);
};
