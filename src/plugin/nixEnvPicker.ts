import { commands, Terminal, Uri, window, workspace } from 'vscode';
import { ConfigurationManager, Logger, NixEnvironmentPicker, UserInterface } from '../helpers/interfaces';
import { expandVariables } from '../helpers/path';
import { applyEnvVars, findNixFiles, loadEnvironmentSync } from '../helpers/process';
import { AUTO_ACTIVATE_COMMAND_KEY, CUSTOM_ENV_VARS_KEY } from '../vscode/configuration';

export class NixEnvPicker implements NixEnvironmentPicker {
    constructor(
        private logger: Logger,
        private config: ConfigurationManager,
        private ui: UserInterface
    ) { }

    public async selectAndSaveEnvironment(): Promise<void> {
        try {
            const nixFiles = await findNixFiles(this.logger);

            const selectedFile = await this.ui.showEnvFileSelector(nixFiles);
            if (!selectedFile) {
                this.logger.info('No file selected, operation canceled');
                return;
            }

            await this.config.setEnvFilePath(selectedFile.relativePath);
            this.logger.info(`Environment path saved: ${selectedFile.relativePath}`);

            const reload = await this.ui.showInformationMessage(
                'Nix environment loaded, reload required',
                'Reload Window'
            );

            if (reload === 'Reload Window') {
                await this.ui.requestReload();
            }
        } catch (error) {
            this.logger.error('Error selecting Nix environment');
            this.logger.error(error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public autoLoadEnvironment(): boolean {
        try {
            const envPath = this.config.getEnvFilePath();

            const expandedPath = expandVariables(envPath, this.logger);
            const envVars = loadEnvironmentSync(expandedPath, this.logger);

            if (!envVars || envVars.length === 0) {
                this.logger.info('No environment variables were loaded');
                return false;
            }

            applyEnvVars(envVars, this.logger);
            this.logger.info(`Successfully loaded environment from: ${envPath}`);
            return true;
        } catch (error) {
            this.logger.error('Error auto-loading environment');
            this.logger.error(error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    public activateInTerminal(terminal: Terminal, activationCommand: string): boolean {
        try {
            if (!activationCommand) {
                this.logger.info('No legal activation command provided, skipping terminal activation');
                return false;
            }
            terminal.sendText(activationCommand);
            this.logger.info(`Successfully executed activation command`);
            return true;
        } catch (error) {
            this.logger.error('Error activating environment in terminal');
            this.logger.error(error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    public async editCustomEnvVars(): Promise<void> {
        try {
            await commands.executeCommand('workbench.action.openWorkspaceSettingsFile');
            await this.config.initCustomEnvVars();

            const workspaceSettingsUri = Uri.joinPath(
                workspace.workspaceFolders?.[0]?.uri || Uri.file(''),
                '.vscode',
                'settings.json'
            );

            await this.ui.locateKeyLocation(CUSTOM_ENV_VARS_KEY, workspaceSettingsUri.fsPath, this.logger);

            await this.ui.saveListener(workspaceSettingsUri.fsPath);

        } catch (error) {
            this.logger.error('Error loading custom environment variables');
            throw error;
        }
    }

    public async editTerminalAutoActivateCommand(): Promise<void> {
        try {
            await commands.executeCommand('workbench.action.openWorkspaceSettingsFile');
            await this.config.initAutoActivateCommand();

            const workspaceSettingsUri = Uri.joinPath(
                workspace.workspaceFolders?.[0]?.uri || Uri.file(''),
                '.vscode',
                'settings.json'
            );

            await this.ui.locateKeyLocation(AUTO_ACTIVATE_COMMAND_KEY, workspaceSettingsUri.fsPath, this.logger);
            this.logger.info(`Successfully located key location for ${AUTO_ACTIVATE_COMMAND_KEY}`);
        } catch (error) {
            this.logger.error('Error loading terminal auto-activate command');
            throw error;
        }
    }

    public async toggleTerminalAutoActivate(): Promise<void> {
        const config = this.config.getAutoActivateStatus();
        const newValue = !config;
        const action = newValue ? 'Enable' : 'Disable';
        const message = `${action} automatic Nix environment activation in new terminals?`;

        const selection = await window.showInformationMessage(
            message,
            { modal: true },
            'Yes', 'No'
        );

        if (selection === 'Yes') {
            await this.config.setAutoActivateStatus(newValue);
            this.logger.info(`Auto-activate terminal setting changed to: ${newValue}`);

            const status = newValue ? 'enabled' : 'disabled';
            window.showInformationMessage(`Automatic Nix environment activation in new terminals ${status}.`);
        }
    }
}