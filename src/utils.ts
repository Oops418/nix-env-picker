import { ConfigurationTarget, ExtensionContext, StatusBarAlignment, WorkspaceConfiguration, window, workspace } from 'vscode';
import { NixEnvPicker } from './core/NixEnvPicker';

const envConfigKey = 'nixEnvPicker.envFile';

export function setupCore(context: ExtensionContext) {
  let statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);
  statusBar.text = "$(chip) NixEnv";
  statusBar.tooltip = "Click to select Nix environment";
  statusBar.command = 'nix-env-picker.selectNixEnv';
  statusBar.show();
  context.subscriptions.push(statusBar);

  const config = workspace.getConfiguration();
  const log = window.createOutputChannel("Nix Env Picker", { log: true });

  return new NixEnvPicker(statusBar, config, log);
}

export async function setWorkspaceState(picker: NixEnvPicker, value: string): Promise<void> {
  picker.config.update(envConfigKey, value, ConfigurationTarget.Workspace).then(() => {
    picker.log.info(`Settings updated: ${envConfigKey} = ${value}`);
  }, (err) => {
    picker.log.error(`Failed to update settings: ${err}`);
    window.showErrorMessage(`Failed to update settings: ${err.message}`);
  });
}

export function getWorkspaceState(config: WorkspaceConfiguration): string {
  return config.get(envConfigKey) ?? "";
}

export function handleError(picker: NixEnvPicker, logMessage: string, statusBarText: string, windowMessage: string): void {
  picker.log.error(logMessage);
  picker.statusBar.text = statusBarText;
  window.showErrorMessage(
    windowMessage,
    'Open Output'
  ).then(selection => {
    if (selection === 'Open Output') {
      picker.log.show();
    }
  });
}

