import { ConfigurationTarget, ExtensionContext, StatusBarAlignment, window, workspace } from 'vscode';
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

export function getWorkspaceState(picker: NixEnvPicker): string | null {
  try {
    const originalConfigValue = picker.config.get<string>(envConfigKey);

    if (!originalConfigValue) {
      picker.log.info(`The value of ${envConfigKey} is empty`);
      return null;
    }

    picker.log.info(`Settings loaded: ${envConfigKey} = ${originalConfigValue}`);
    return parseVariable(picker, originalConfigValue);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    picker.log.error(`Error retrieving workspace state: ${errorMessage}`);
    return null;
  }
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

export function parseVariable(picker: NixEnvPicker, value: string): string {
  if (!value) {
    return '';
  }

  if (value.includes('${userHome}')) {
    const homedir = require('os').homedir();
    value = value.replace(/\${userHome}/g, homedir);
  }

  if (value.includes('${workspaceFolder}')) {
    const workspaceFolder = workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      value = value.replace(/\${workspaceFolder}/g, workspaceFolder.uri.fsPath);
    }
  }

  if (value.includes('${workspaceFolderBasename}')) {
    const workspaceFolder = workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      value = value.replace(/\${workspaceFolderBasename}/g, workspaceFolder.name);
    }
  }

  if (value.includes('${pathSeparator}') || value.includes('${/}')) {
    const pathSeparator = require('path').sep;
    value = value.replace(/\${pathSeparator}/g, pathSeparator);
    value = value.replace(/\${\/}/g, pathSeparator);
  }

  picker.log.info(`Converted value: ${value}`);

  return value;
}
