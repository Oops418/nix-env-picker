import * as path from 'path';
import { commands, Uri, workspace } from 'vscode';
import { ConfigurationManager, Logger, NixEnvironmentFile, UserInterface } from '../helpers/interfaces';
import { expandVariables } from '../helpers/path';
import { loadEnvironmentSync } from './envLoader';
import { applyEnvVars, promptCustomEnvVars } from './envVariables';
// Import the constant from configuration

export class NixEnvironment {
    constructor(
        private logger: Logger,
        private config: ConfigurationManager,
        private ui: UserInterface
    ) { }

    public async findNixFiles(): Promise<NixEnvironmentFile[]> {
        try {
            if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
                this.logger.error('No workspace folder open');
                throw new Error('No workspace folder open');
            }

            const workspaceRoot = workspace.workspaceFolders[0].uri.fsPath;
            const nixFiles = await workspace.findFiles('*.nix', null);

            return nixFiles.map(file => ({
                name: path.relative(workspaceRoot, file.fsPath),
                path: file.fsPath,
                relativePath: "${workspaceFolder}${/}" + path.relative(workspaceRoot, file.fsPath)
            }));
        } catch (error) {
            this.logger.error('Error finding Nix files in workspace');
            this.logger.error(error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public async selectAndSaveEnvironment(): Promise<void> {
        try {
            const nixFiles = await this.findNixFiles();

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
            if (!envPath) {
                this.logger.info('No environment path configured');
                return false;
            }

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

    public async editCustomEnvVars(): Promise<void> {
        try {
            await commands.executeCommand('workbench.action.openWorkspaceSettingsFile');

            await this.config.updateCustomEnvVars({
                set: {},
                unset: []
            });

            const workspaceSettingsUri = Uri.joinPath(
                workspace.workspaceFolders?.[0]?.uri || Uri.file(''),
                '.vscode',
                'settings.json'
            );

            await promptCustomEnvVars(workspaceSettingsUri.fsPath, this.logger);

            await this.ui.saveListener(workspaceSettingsUri.fsPath);

        } catch (error) {
            this.logger.error('Error loading custom environment variables');
            throw error;
        }
    }
}