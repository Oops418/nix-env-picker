import { LogOutputChannel, StatusBarItem, window, workspace, WorkspaceConfiguration } from 'vscode';
import { getWorkspaceState, handleError } from '../utils';
import EnvManager from './EnvManager';

export class NixEnvPicker {
    public statusBar: StatusBarItem;
    public config: WorkspaceConfiguration;
    public log: LogOutputChannel;

    constructor(statusBar: StatusBarItem, config: WorkspaceConfiguration, log: LogOutputChannel) {
        this.statusBar = statusBar;
        this.config = config;
        this.log = log;
    }

    public async selectEnvironment(): Promise<void> {
        if (!workspace.workspaceFolders) {
            window.showErrorMessage('No workspace folder open');
            return;
        }

        this.statusBar.text = "$(sync~spin) Selecting Nix Env...";
        const workspaceRoot = workspace.workspaceFolders[0].uri;

        try {
            await EnvManager.selectNixEnv(this, workspaceRoot);
        } catch (err) {
            handleError(
                this, `${err}`, '$(error) NixEnv',
                'Failed to select Nix environment, check output for details.'
            );
        }
    }

    public setStatusBar(text: string) {
        this.statusBar.text = text;
    }

    public autoLoadEnv(picker: NixEnvPicker): string | void {
        try {
            const envPath = getWorkspaceState(picker);
            if (!envPath) {
                picker.log.info('No environment path found in workspace state');
                return;
            }
            const envVars = EnvManager.autoloadEnv(envPath, picker.log);
            if (!envVars) {
                picker.log.info('No environment variables found');
                return;
            }

            EnvManager.setEnv(envVars, picker.log);
            picker.log.info(`Auto load environment successfully: ${envPath}`);

        } catch (err) {
            handleError(
                this, `${err}`, '$(error) NixEnv',
                'Failed to auto Nix environment, check output for details.'
            );
        }
    }
}