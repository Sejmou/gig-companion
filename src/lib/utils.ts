export class TwoWayMap<K, V> {
	private keyToValueMap: Map<K, V>;
	private valueToKeyMap: Map<V, K>;

	constructor(entries?: readonly (readonly [K, V])[] | null) {
		this.keyToValueMap = new Map<K, V>(entries);
		this.valueToKeyMap = new Map<V, K>(entries?.map(([k, v]) => [v, k]));
	}

	set(key: K, value: V): void {
		this.keyToValueMap.set(key, value);
		this.valueToKeyMap.set(value, key);
	}

	getByKey(key: K): V | undefined {
		return this.keyToValueMap.get(key);
	}

	getByValue(value: V): K | undefined {
		return this.valueToKeyMap.get(value);
	}

	removeByKey(key: K): void {
		const value = this.keyToValueMap.get(key);
		if (value !== undefined) {
			this.keyToValueMap.delete(key);
			this.valueToKeyMap.delete(value);
		}
	}

	removeByValue(value: V): void {
		const key = this.valueToKeyMap.get(value);
		if (key !== undefined) {
			this.keyToValueMap.delete(key);
			this.valueToKeyMap.delete(value);
		}
	}
}
