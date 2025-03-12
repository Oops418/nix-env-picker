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

    const customEnvVarsCommand = commands.registerCommand(
        'nix-env-picker.customEnvVars',
        async () => {
            try {
                statusBar.setLoading();
                await nixEnv.editCustomEnvVars();
                statusBar.setDefault();
            } catch (error) {
                logger.error(`Error in customEnvVars command: ${error}`);
                statusBar.setError();
            }
        }
    );

    context.subscriptions.push(selectCommand, customEnvVarsCommand);
    logger.info('Commands registered');
}