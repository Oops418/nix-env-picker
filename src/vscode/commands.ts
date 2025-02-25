import { commands, ExtensionContext } from 'vscode';
import { Logger } from '../helpers/interfaces';
import { NixEnvironment } from '../plugin/nixEnv';

export function registerCommands(
    context: ExtensionContext,
    nixEnv: NixEnvironment,
    statusBar: { setLoading: () => void, setDefault: () => void, setError: () => void },
    logger: Logger
): void {
    const selectCommand = commands.registerCommand(
        'nix-env-picker.selectNixEnv',
        async () => {
            try {
                statusBar.setLoading();
                await nixEnv.selectAndSaveEnvironment();
                statusBar.setDefault();
            } catch (error) {
                logger.error(`Error in selectNixEnv command: ${error}`);
                statusBar.setError();
            }
        }
    );

    context.subscriptions.push(selectCommand);
    logger.info('Commands registered');
}