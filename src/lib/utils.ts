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

type ServiceMonitorConfig = {
	checkInterval: number;
	startService: () => Promise<boolean> | boolean;
	checkServiceRunning: () => Promise<boolean> | boolean;
	serviceName: string;
	onServiceOnline?: () => void;
	onServiceOffline?: () => void;
	onStartSuccess?: () => void;
	onStartFailure?: () => void;
};

export class ServiceMonitor {
	private intervalId: number | NodeJS.Timeout | null = null;
	private startingService: boolean = false;
	private readonly checkInterval: number;
	private startService: () => Promise<boolean> | boolean;
	private lastServiceRunning: boolean = false;
	private checkServiceRunning: () => Promise<boolean> | boolean;
	private readonly serviceName: string;
	private onServiceOnline?: () => void;
	private onServiceOffline?: () => void;
	private onStartSuccess?: () => void;
	private onStartFailure?: () => void;

	constructor(config: ServiceMonitorConfig) {
		this.checkInterval = config.checkInterval;
		this.startService = config.startService;
		this.checkServiceRunning = config.checkServiceRunning;
		this.serviceName = config.serviceName;
		this.onServiceOnline = config.onServiceOnline;
		this.onServiceOffline = config.onServiceOffline;
		this.onStartSuccess = config.onStartSuccess;
		this.onStartFailure = config.onStartFailure;
	}

	start() {
		this.intervalId = setInterval(async () => {
			const running = await this.checkServiceRunning();
			if (running && !this.lastServiceRunning) {
				console.log(`${this.serviceName} online`);
				if (this.onServiceOnline) {
					this.onServiceOnline();
				}
			} else if (!running && this.lastServiceRunning) {
				console.log(`${this.serviceName} offline`);
				if (this.onServiceOffline) {
					this.onServiceOffline();
				}
			}
			this.lastServiceRunning = running;
			if (!running) {
				if (!this.startingService) {
					console.log(`${this.serviceName} not running. Starting...`);
					this.startingService = true;
					const success = await this.startService();
					if (success) {
						console.log(`${this.serviceName} startup succeeded`);
						if (this.onStartSuccess) {
							this.onStartSuccess();
						}
					} else {
						console.error(`${this.serviceName} startup failed`);
						if (this.onStartFailure) {
							this.onStartFailure();
						}
					}
					this.startingService = false;
				}
			}
		}, this.checkInterval);
	}

	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			this.startingService = false;
		}
	}
}
