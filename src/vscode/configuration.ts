import { ConfigurationTarget, workspace } from 'vscode';
import { ConfigurationManager, EnvVariables, Logger } from '../helpers/interfaces';
import { expandVariables } from '../helpers/path';
import { detectNixFormat, getTerminalAutoActivateCommand } from '../helpers/process';

const ENV_CONFIG_KEY = 'nixEnvPicker.envFile';
export const CUSTOM_ENV_VARS_KEY = 'nixEnvPicker.customEnvVars';
const AUTO_ACTIVATE_STATUS_KEY = 'nixEnvPicker.terminalAutoActivate';
export const AUTO_ACTIVATE_COMMAND_KEY = 'nixEnvPicker.terminalActivateCommand';

export class VSCodeConfigManager implements ConfigurationManager {
    constructor(private logger: Logger) { }

    public getEnvFilePath(): string {
        try {
            const config = workspace.getConfiguration();
            const value = config.get<string>(ENV_CONFIG_KEY);

            if (!value) {
                this.logger.info(`No value found for ${ENV_CONFIG_KEY}`);
                return "";
            }

            this.logger.info(`Config loaded: ${ENV_CONFIG_KEY} = ${value}`);
            return value;
        } catch (error) {
            this.logger.error(`Error getting configuration: ${error}`);
            return "";
        }
    }

    public async setEnvFilePath(path: string): Promise<boolean> {
        try {
            const config = workspace.getConfiguration();
            await config.update(ENV_CONFIG_KEY, path, ConfigurationTarget.Workspace);
            this.logger.info(`Config updated: ${ENV_CONFIG_KEY} = ${path}`);
            return true;
        } catch (error) {
            this.logger.error(`Error setting configuration: ${error}`);
            return false;
        }
    }

    public getCustomEnvVars(): EnvVariables {
        try {
            const config = workspace.getConfiguration();
            const value = config.get<EnvVariables>(CUSTOM_ENV_VARS_KEY);

            if (!value) {
                this.logger.info(`No value found for ${CUSTOM_ENV_VARS_KEY}, using defaults`);
                return { set: {}, unset: [] };
            }

            this.logger.info(`Config loaded: ${CUSTOM_ENV_VARS_KEY}`);
            return value;
        } catch (error) {
            this.logger.error(`Error getting custom env vars configuration: ${error}`);
            return { set: {}, unset: [] };
        }
    }

    public async setCustomEnvVars(envVars: EnvVariables): Promise<boolean> {
        try {
            const config = workspace.getConfiguration();
            await config.update(CUSTOM_ENV_VARS_KEY, envVars, ConfigurationTarget.Workspace);
            this.logger.info(`Config updated: ${CUSTOM_ENV_VARS_KEY}`);
            return true;
        } catch (error) {
            this.logger.error(`Error setting custom env vars configuration: ${error}`);
            return false;
        }
    }

    public async initCustomEnvVars(): Promise<void> {
        try {
            const existingEnvVars = this.getCustomEnvVars();
            if (Object.keys(existingEnvVars.set).length > 0 || existingEnvVars.unset.length > 0) {
                return;
            } else {
                await this.setCustomEnvVars({ set: {}, unset: [] });
            }
        } catch (error) {
            throw new Error(`Error initializing custom env vars configuration: ${error}`);
        }
    }

    public async initAutoActivateCommand(): Promise<void> {
        const config = workspace.getConfiguration();
        if (!config.get<string>(AUTO_ACTIVATE_COMMAND_KEY)) {
            await config.update(AUTO_ACTIVATE_COMMAND_KEY, " ", ConfigurationTarget.Workspace);
            return;
        }
        return;
    }

    public getAutoActivateStatus(): boolean {
        const config = workspace.getConfiguration();
        const value = config.get<boolean>(AUTO_ACTIVATE_STATUS_KEY, false);
        return value;
    }

    public getAutoActivateCommand(): string {
        try {
            const config = workspace.getConfiguration();
            const value = config.get<string>(AUTO_ACTIVATE_COMMAND_KEY);
            if (!value) {
                const envFilePath = this.getEnvFilePath();
                if (!envFilePath) {
                    return '';
                }
                const expandedPath = expandVariables(envFilePath, this.logger);
                const format = detectNixFormat(expandedPath, this.logger);
                const cmd = getTerminalAutoActivateCommand(expandedPath, format);
                this.logger.info(`Terminal auto-activate using default command: ${cmd}`);
                return cmd;
            } else {
                this.logger.info(`Terminal auto-activate using configured command: ${value}`);
                return value;
            }
        } catch (error) {
            this.logger.error(`Error getting auto activate command: ${error}`);
            return '';
        }
    }

    public async setAutoActivateStatus(status: boolean): Promise<boolean> {
        const config = workspace.getConfiguration();
        await config.update(AUTO_ACTIVATE_STATUS_KEY, status, ConfigurationTarget.Workspace);
        this.logger.info(`Config updated: ${AUTO_ACTIVATE_STATUS_KEY} = ${status}`);
        return true;
    }
}