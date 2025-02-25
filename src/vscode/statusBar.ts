import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { Logger } from '../helpers/interfaces';

export class StatusBarManager {
    private statusBar: StatusBarItem;

    constructor(
        private logger: Logger,
        private command: string = 'nix-env-picker.selectNixEnv'
    ) {
        this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
        this.statusBar.command = command;
        this.setDefault();
        this.statusBar.show();
        this.logger.info('Status bar initialized');
    }

    public setDefault(): void {
        this.statusBar.text = "$(chip) NixEnv";
        this.statusBar.tooltip = "Click to select Nix environment";
    }

    public setText(text: string, tooltip?: string): void {
        this.statusBar.text = text;
        if (tooltip) {
            this.statusBar.tooltip = tooltip;
        }
    }

    public setLoading(): void {
        this.statusBar.text = "$(sync~spin) Loading Nix Env...";
    }

    public setError(): void {
        this.statusBar.text = "$(error) NixEnv";
        this.statusBar.tooltip = "Error with Nix environment, click to retry";
    }

    public dispose(): void {
        this.statusBar.dispose();
    }
}