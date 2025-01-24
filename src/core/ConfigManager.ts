import { workspace, ExtensionContext } from 'vscode';

export interface NixEnvConfig {
    shellFile?: string;
    cmdArgs?: string;
}

export class ConfigManager {
  private static readonly Plugin = 'nixEnvPicker';
  
  static getSettingValue<T>(key: keyof NixEnvConfig): T | undefined {
    return workspace
      .getConfiguration(this.Plugin)
      .get<T>(key);
  }

  static async setSettingValue<T>(key: keyof NixEnvConfig, value: T): Promise<void> {
    await workspace
      .getConfiguration(this.Plugin)
      .update(key, value, true);
  }

  static async setWorkspaceState(context: ExtensionContext, key: string, value: string): Promise<void> {
    context.workspaceState.update(this.Plugin + "." + key, value);
  }

  static getWorkspaceState(context: ExtensionContext, key: string): any {
    context.workspaceState.get(this.Plugin + "." + key);
  }
}