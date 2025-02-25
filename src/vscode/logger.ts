import { LogOutputChannel, window } from 'vscode';
import { Logger } from '../helpers/interfaces';

export class VSCodeLogger implements Logger {
    private channel: LogOutputChannel;

    constructor(name: string = 'Nix Env Picker') {
        this.channel = window.createOutputChannel(name, { log: true });
    }

    public info(message: string): void {
        this.channel.info(message);
    }

    public error(message: string): void {
        this.channel.error(message);
    }

    public warning(message: string): void {
        this.channel.warn(message);
    }

    public show(): void {
        this.channel.show();
    }
}