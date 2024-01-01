export type ActionsMap<T extends { name: string }> = {
	[K in T['name']]: Extract<T, { name: K }>;
};
