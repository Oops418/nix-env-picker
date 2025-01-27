import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { commands, LogOutputChannel, QuickPickItem, Uri, window, workspace } from 'vscode';
import { setWorkspaceState } from '../utils';
import { NixEnvPicker } from './NixEnvPicker';

interface EnvVar {
  name: string;
  value: string;
}

interface NixFileQuickPickItem extends QuickPickItem {
  fullPath: string;
}

enum NixFormat {
  FLAKE = 'flake',
  PURE = 'pure',
  NONE = 'none'
}

const execAsync = promisify(exec);

class EnvManager {
  public static async selectNixEnv(picker: NixEnvPicker, workspaceRoot: Uri): Promise<void> {
    try {
      const nixFileItems = await this.findNixFiles(workspaceRoot);
      const selectedFile = await this.showFileSelectionDialog(nixFileItems);

      if (!selectedFile) {
        this.resetStatusBar(picker);
        return;
      }

      await this.handleFileSelection(picker, selectedFile);
    } catch (error) {
      throw error;
    }
  }

  private static async findNixFiles(workspaceRoot: Uri): Promise<NixFileQuickPickItem[]> {
    const nixFiles = await workspace.findFiles('*.nix', null);
    const nixFileItems = nixFiles.map(file => ({
      label: path.relative(workspaceRoot.fsPath, file.fsPath),
      fullPath: file.fsPath
    }));

    nixFileItems.push({
      label: "Browse...",
      fullPath: ""
    });

    return nixFileItems;
  }

  private static async showFileSelectionDialog(items: NixFileQuickPickItem[]): Promise<NixFileQuickPickItem | undefined> {
    return window.showQuickPick(items, {
      placeHolder: 'Select a Nix environment file'
    });
  }

  private static async handleFileSelection(picker: NixEnvPicker, selected: NixFileQuickPickItem): Promise<void> {
    if (selected.label === "Browse...") {
      await this.handleBrowseOption(picker);
      return;
    }

    picker.log.info(`Selected ${selected.label}`);
    await this.saveEnvPath(picker, selected.fullPath);
  }

  private static async handleBrowseOption(picker: NixEnvPicker): Promise<void> {
    picker.log.info('Browse selected');
    const result = await window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
    });

    if (result?.[0]) {
      await this.saveEnvPath(picker, result[0].fsPath);
    } else {
      window.showInformationMessage('No file selected');
      this.resetStatusBar(picker);
    }
  }

  private static resetStatusBar(picker: NixEnvPicker): void {
    picker.setStatusBar("$(chip) NixEnv");
  }

  private static async saveEnvPath(picker: NixEnvPicker, envPath: string): Promise<void> {
    try {
      await setWorkspaceState(picker, envPath);
      picker.log.info(`Env Path saved: ${envPath}`);

      const selection = await window.showInformationMessage(
        'Nix environment loaded, reload required',
        'Reload Window'
      );

      if (selection === 'Reload Window') {
        await commands.executeCommand('workbench.action.reloadWindow');
      }
    } catch (error) {
      throw error;
    }
  }

  private static detectNixFormat(filePath: string): NixFormat {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (path.basename(filePath) === "flake.nix" && fileContent.includes('outputs')) {
        return NixFormat.FLAKE;
      }

      if (fileContent.includes('mkShell')) {
        return NixFormat.PURE;
      }

      return NixFormat.NONE;
    } catch (error) {
      throw new Error(`Failed to detect Nix format for file at ${filePath}: ${error}`);
    }
  }


  private static getCmd(nixPath: string): string {
    if (!nixPath) {
      throw new Error('Nix environment file is illegal');
    }

    const format = this.detectNixFormat(nixPath);
    switch (format) {
      case NixFormat.FLAKE:
        return `nix develop "${path.dirname(nixPath)}" --command bash -c "export"`;
      case NixFormat.PURE:
        return `nix-shell "${nixPath}" --run export`;
      case NixFormat.NONE:
        throw new Error('Unsupported Nix format');
      default:
        throw new Error('Unsupported Nix format');
    }
  }

  private static parseExportedVars(output: string): EnvVar[] {
    const regex = /declare -x ([A-Za-z0-9_]+)="((?:\\.|[^"\\])*)"/g;
    const vars: EnvVar[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(output)) !== null) {
      vars.push({ name: match[1], value: match[2] });
    }
    return vars;
  }

  static async loadEnvAsync(envPath: string, log: vscode.LogOutputChannel): Promise<EnvVar[]> {
    const cmd = await this.getCmd(envPath);
    log.info(`exec cmd async: ${cmd}`);

    try {
      const { stdout } = await execAsync(cmd);
      return this.parseExportedVars(stdout);
    } catch (err) {
      log.error(`Error while running command: ${cmd}`);
      throw err;
    }
  }

  static autoloadEnv(envPath: string, log: vscode.LogOutputChannel): EnvVar[] {
    try {
      const cmd = this.getCmd(envPath);
      const output = execSync(cmd).toString();
      return this.parseExportedVars(output);
    } catch (err) {
      log.error(`Error while autoloadEnv`);
      throw err;
    }
  }


  static setEnv(envVars: EnvVar[], log: LogOutputChannel): void {
    try {
      envVars.forEach(({ name, value }) => { process.env[name] = value; });
      log.info('Environment variables set successfully');
    } catch (error) {
      throw error;
    }
  }
}

export default EnvManager;