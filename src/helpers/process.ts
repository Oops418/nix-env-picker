import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { Logger } from './interfaces';

export const execAsync = promisify(exec);

export async function executeCommand(cmd: string, logger: Logger): Promise<string> {
    logger.info(`Executing command: ${cmd}`);
    try {
        const { stdout } = await execAsync(cmd);
        return stdout;
    } catch (error) {
        logger.error(`Error executing command: ${cmd}`);
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}

export function executeCommandSync(cmd: string, logger: Logger): string {
    logger.info(`Executing command synchronously: ${cmd}`);
    try {
        const output = execSync(cmd).toString();
        return output;
    } catch (error) {
        logger.error(`Error executing command synchronously: ${cmd}`);
        logger.error(error instanceof Error ? error.message : String(error));
        throw error;
    }
}