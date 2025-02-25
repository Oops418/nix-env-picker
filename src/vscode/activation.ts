import { ExtensionContext } from 'vscode';
import { NixEnvironment } from '../plugin/nixEnv';
import { registerCommands } from './commands';
import { VSCodeConfigManager } from './configuration';
import { VSCodeLogger } from './logger';
import { StatusBarManager } from './statusBar';
import { VSCodeUI } from './ui';

export function activate(context: ExtensionContext): void {
    const logger = new VSCodeLogger();
    logger.info('Starting Nix Env Picker extension');

    try {
        const configManager = new VSCodeConfigManager(logger);
        const ui = new VSCodeUI(logger);

        const statusBar = new StatusBarManager(logger);
        context.subscriptions.push(statusBar);

        const nixEnv = new NixEnvironment(logger, configManager, ui);

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