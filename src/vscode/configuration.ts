import { ConfigurationTarget, workspace } from 'vscode';
import { ConfigurationManager, Logger } from '../helpers/interfaces';

const ENV_CONFIG_KEY = 'nixEnvPicker.envFile';

export class VSCodeConfigManager implements ConfigurationManager {
    constructor(private logger: Logger) { }

    public getEnvFilePath(): string | null {
        try {
            const config = workspace.getConfiguration();
            const value = config.get<string>(ENV_CONFIG_KEY);

            if (!value) {
                this.logger.info(`No value found for ${ENV_CONFIG_KEY}`);
                return null;
            }

            this.logger.info(`Config loaded: ${ENV_CONFIG_KEY} = ${value}`);
            return value;
        } catch (error) {
            this.logger.error(`Error getting configuration: ${error}`);
            return null;
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
}