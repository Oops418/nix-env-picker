import { ConfigurationTarget, workspace } from 'vscode';
import { ConfigurationManager, EnvVariables, Logger } from '../helpers/interfaces';

const ENV_CONFIG_KEY = 'nixEnvPicker.envFile';
export const CUSTOM_ENV_VARS_KEY = 'nixEnvPicker.customEnvVars';

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

    public async updateCustomEnvVars(envVars: EnvVariables): Promise<boolean> {
        try {
            const existingEnvVars = this.getCustomEnvVars();
            const updatedEnvVars = {
                set: { ...existingEnvVars.set, ...envVars.set },
                unset: [...existingEnvVars.unset, ...envVars.unset]
            };
            const config = workspace.getConfiguration();
            await config.update(CUSTOM_ENV_VARS_KEY, updatedEnvVars, ConfigurationTarget.Workspace);
            this.logger.info(`Config updated: ${CUSTOM_ENV_VARS_KEY}`);
            return true;
        } catch (error) {
            this.logger.error(`Error setting custom env vars configuration: ${error}`);
            return false;
        }
    }
}