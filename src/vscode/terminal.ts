import { Disposable, Terminal, window } from 'vscode';
import { Logger } from '../helpers/interfaces';
import { NixEnvPicker } from '../plugin/nixEnvPicker';
import { VSCodeConfigManager } from './configuration';

export class TerminalManager implements Disposable {
    private terminalListener: Disposable;

    constructor(
        private logger: Logger,
        private configManager: VSCodeConfigManager,
        private nixEnv: NixEnvPicker
    ) {
        this.terminalListener = window.onDidOpenTerminal(this.handleNewTerminal.bind(this));
        this.logger.info('Terminal listener registered');
    }

    private handleNewTerminal(terminal: Terminal): void {
        try {
            const autoActivateStatus = this.configManager.getAutoActivateStatus();

            if (autoActivateStatus === false) {
                this.logger.info('Terminal auto-activation is disabled, skipping');
                return;
            }
            if (autoActivateStatus === true) {
                const autoActivateCommand = this.configManager.getAutoActivateCommand();
                if (autoActivateCommand) {
                    this.nixEnv.activateInTerminal(terminal, autoActivateCommand);
                } else {
                    this.logger.info('No legal terminal auto-activate command configured, skipping');
                }
                return;
            }
            this.logger.error('Invalid auto-activate status, skipping');
        } catch (error) {
            this.logger.error(`Error activating environment in terminal: ${error}`);
        }
    }

    public dispose(): void {
        this.terminalListener.dispose();
    }
} 