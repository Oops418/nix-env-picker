import { exec, execSync } from 'child_process';
import { dirname } from 'path';
import * as vscode from 'vscode';

interface EnvVar {
  name: string;
  value: string;
}

class EnvManager {
  
  private static async detectNixFormat(filePath: string): Promise<'flake' | 'pure' | 'none'> {
    try {
      const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
      const fileContent = Buffer.from(content).toString('utf8');
      
      if (fileContent.includes('outputs')) {
        return 'flake';
      } else if (fileContent.includes('mkShell')) {
        return 'pure';
      } else {
        return 'none';
      }
    } catch (error) {
      return 'none';
    }
  }

  private static getCmd(nixPath: string): string {

    let cmd = '';
  
    if (nixPath) {
      this.detectNixFormat(nixPath).then((format) => {
        switch (format) {
          case 'flake':
            cmd = `nix develop ${nixPath} --command env`;
            break;
          
          case 'pure':
            cmd = `nix-shell "${nixPath}" --run export`;
            break;
          
          case 'none':
            cmd = `nix-shell "${nixPath}" --run export`;

          default :
            cmd = `nix-shell "${nixPath}" --run export`;
            break;
        }
      });
    } else {
      cmd = 'test none';
    }
  
    return cmd;
  }

  private static parseExportedVars(output: string): EnvVar[] {
    return output
      .split('declare -x')
      .filter(Boolean)
      .map(line => {
        const [name, ...valueParts] = line.trim().split('=');
        const value = valueParts.join('=');
        try {
          return {
            name,
            value: JSON.parse(value)
          };
        } catch {
          return { name, value: null };
        }
      })
      .filter(({ value }) => value !== null);
  }

  static async loadEnvAsync(envPath: string, log: vscode.LogOutputChannel): Promise<EnvVar[]> {
    const cmd = this.getCmd(envPath);
    log.info(`Running command asynchronously: ${cmd}`);
    return new Promise((resolve, reject) => {
      exec(cmd, {cwd: envPath ? dirname(envPath) : undefined}, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.parseExportedVars(stdout));
        }
      });
    });
  }

  static setEnv(envVars: EnvVar[]): void {
    envVars.forEach(({ name, value }) => {
      process.env[name] = value;
    });
  }
}

export default EnvManager;