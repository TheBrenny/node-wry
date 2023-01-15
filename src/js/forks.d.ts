export interface ForkSettings extends ForkReuseSettings {
    name: String;
};

export interface ForkReuseSettings {
    fn: String | Function;
    args?: any[] = [];
    messageHandler?: Function | null = null;
}

export class Fork {
    constructor(settings: ForkSettings);
    reuse(settings: ForkReuseSettings): boolean;
    get promise(): Promise;
    get retVal(): any;
    get retValCache(): any[];
    get isConnected(): boolean;

    kill(signal: number | NodeJS.Signals | undefined): void;
}