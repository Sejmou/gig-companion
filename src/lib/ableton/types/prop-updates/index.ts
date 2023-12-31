import { isChange } from '..';
import type { SetUpdate } from './set';
import type { TrackUpdate } from './track';

export type PropUpdate = TrackUpdate | SetUpdate;
export type PropUpdateScope = PropUpdate['scope'];
const propUpdateScopes: PropUpdateScope[] = ['track', 'set'] as const;

export const isPropUpdate = (unknown: unknown): unknown is PropUpdate => {
	return (
		isChange(unknown) &&
		unknown.type == 'propUpdate' &&
		'scope' in unknown &&
		propUpdateScopes.includes(unknown.scope)
	);
};
