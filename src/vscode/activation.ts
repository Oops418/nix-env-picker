import { ExtensionContext } from 'vscode';
import { NixEnvPicker } from '../plugin/nixEnvPicker';
import { registerCommands } from './commands';
import { VSCodeConfigManager } from './configuration';
import { VSCodeLogger } from './logger';
import { StatusBarManager } from './statusBar';
import { TerminalManager } from './terminal';
import { VSCodeUI } from './ui';

export function activate(context: ExtensionContext): void {
    const logger = new VSCodeLogger();
    logger.info('Starting Nix Env Picker extension');

    try {
        const configManager = new VSCodeConfigManager(logger);
        const ui = new VSCodeUI(logger);
        const nixEnv = new NixEnvPicker(logger, configManager, ui);

        const statusBar = new StatusBarManager(logger);
        context.subscriptions.push(statusBar);

        const terminalManager = new TerminalManager(logger, configManager, nixEnv);
        context.subscriptions.push(terminalManager);

        registerCommands(context, nixEnv, statusBar, logger);

        try {
            const loaded = nixEnv.autoLoadEnvironment();
            if (loaded) {
                logger.info('Successfully auto-loaded Nix environment');
            } else {
                logger.info('No Nix environment auto-loaded');
            }
        } catch (error) {
            logger.error(`Error auto-loading environment: ${error}`);
            statusBar.setError();
        }

        logger.info('Nix Env Picker extension activated');
    } catch (error) {
        logger.error(`Error during extension activation: ${error}`);
    }
}