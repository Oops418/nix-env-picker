import { commands, ExtensionContext } from 'vscode';
import { Logger, NixEnvironmentPicker, StatusBar } from '../helpers/interfaces';

export function registerCommands(
    context: ExtensionContext,
    nixEnv: NixEnvironmentPicker,
    statusBar: StatusBar,
    logger: Logger,
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

    const toggleTerminalAutoActivateCommand = commands.registerCommand(
        'nix-env-picker.terminalAutoActivate',
        async () => {
            try {
                statusBar.setLoading();
                await nixEnv.toggleTerminalAutoActivate();
                statusBar.setDefault();
            } catch (error) {
                logger.error(`Error in toggleAutoActivate command: ${error}`);
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

    const customTerminalActivateCommand = commands.registerCommand(
        'nix-env-picker.terminalActivateCommand',
        async () => {
            try {
                statusBar.setLoading();
                await nixEnv.editTerminalAutoActivateCommand();
                statusBar.setDefault();
            } catch (error) {
                logger.error(`Error in terminalActivateCommand command: ${error}`);
                statusBar.setError();
            }
        }
    );

    context.subscriptions.push(selectCommand, customEnvVarsCommand, toggleTerminalAutoActivateCommand, customTerminalActivateCommand);
    logger.info('Commands registered');
}