import type { PropUpdate } from './prop-updates';
import type { ClientAction } from './client-actions';
import type { ServerEvent } from './server-events';

export type Change = PropUpdate | ClientAction | ServerEvent;
export type ChangeType = Change['type'];

export const isChange = (unknown: unknown): unknown is Change => {
	return typeof unknown == 'object' && unknown !== null && 'type' in unknown;
};
