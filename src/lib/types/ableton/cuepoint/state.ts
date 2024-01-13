export type CuePoint = {
	id: string;
	name: string;
	time: number;
};

export type CuePointUpdate = {
	id: string;
} & Partial<CuePoint>;
