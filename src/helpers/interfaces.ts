import { Uri } from 'vscode';

export interface EnvVar {
    name: string;
    value: string;
}

export enum NixFormat {
    FLAKE = 'flake',
    PURE = 'pure',
    NONE = 'none'
}

export interface NixEnvironmentFile {
    name: string
    path: string;
    relativePath: string;
    format?: NixFormat;
}

export interface Logger {
    info(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    show(): void;
}

export interface EnvVariables {
    set: Record<string, string>;
    unset: string[];
}

export interface ConfigurationManager {
    getEnvFilePath(): string | null;
    setEnvFilePath(path: string): Promise<boolean>;
    getCustomEnvVars(): EnvVariables;
    setCustomEnvVars(envVars: EnvVariables): Promise<boolean>;
    updateCustomEnvVars(envVars: EnvVariables): Promise<boolean>;
}

export interface UserInterface {
    showEnvFileSelector(files: NixEnvironmentFile[]): Promise<NixEnvironmentFile | undefined>;
    showErrorMessage(message: string): Promise<void>;
    showInformationMessage(message: string, ...actions: string[]): Promise<string | undefined>;
    saveListener(filePath: string): Promise<void>;
    requestReload(): Promise<void>;
    browsePath(): Promise<Uri | undefined>;
}