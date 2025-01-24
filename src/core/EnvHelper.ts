import { ExtensionContext, StatusBarItem, window, workspace, commands, LogOutputChannel} from "vscode";
import EnvManager from "./EnvManager";
import { ConfigManager } from "./ConfigManager";
import * as path from 'path';
import { setStatusBar } from "./StatusBar";
import { log } from "console";

export async function loadEnv(envPath: string, context: ExtensionContext, log: LogOutputChannel): Promise<void> {
  if (!envPath) {
    throw new Error('No env file selected');
  }
  try {
    EnvManager.loadEnvAsync(envPath, log).then((envVars) => {
      if (envVars) {
        log.info("loading env file: " + envPath);
        EnvManager.setEnv(envVars);
        ConfigManager.setWorkspaceState(context, 'envFile', envPath);
      }
    });
  } catch (err) {
    log.error('Error loading env file: ' + envPath);
    throw err;
  }
}

export async function loadEnvWarpper(envPath: string, context: ExtensionContext, statusBar: StatusBarItem, log: LogOutputChannel): Promise<void> {
  const fileName = path.basename(envPath);
  loadEnv(envPath, context, log).then(() => {
    log.info(`Nix environment loaded: ${fileName}`);
    window.showInformationMessage(
      `Nix environment loaded: ${fileName}. Reload required.`,
      'Reload Window'
    ).then(selection => {
        if (selection === 'Reload Window') {
            commands.executeCommand('workbench.action.reloadWindow');
        }
    });
  }).catch(() => {
      window.showErrorMessage('Error loading Nix environment: ' + fileName);
      setStatusBar(statusBar, "$(error) Nix Env");
  });
}

export async function autoLoadEnv(context: ExtensionContext, log: LogOutputChannel): Promise<string | void> {
  let envPath: string;
  if(envPath = ConfigManager.getWorkspaceState(context, 'envFile')) {
    const envVars = await EnvManager.loadEnvAsync(envPath, log);
    if (envVars) {
      EnvManager.setEnv(envVars);
      return envPath;
    }
  }
}