import { Terminal, Uri } from 'vscode';

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

export interface StatusBar {
    setLoading(): void;
    setDefault(): void;
    setError(): void;
}

export interface EnvVariables {
    set: Record<string, string>;
    unset: string[];
}

export interface ConfigurationManager {
    getEnvFilePath(): string;
    setEnvFilePath(path: string): Promise<boolean>;
    getCustomEnvVars(): EnvVariables;
    setCustomEnvVars(envVars: EnvVariables): Promise<boolean>;
    initCustomEnvVars(): Promise<void>;
    getAutoActivateStatus(): boolean;
    setAutoActivateStatus(status: boolean): Promise<boolean>;
    initAutoActivateCommand(): Promise<void>;
}

export interface UserInterface {
    showEnvFileSelector(files: NixEnvironmentFile[]): Promise<NixEnvironmentFile | undefined>;
    showErrorMessage(message: string): Promise<void>;
    showInformationMessage(message: string, ...actions: string[]): Promise<string | undefined>;
    saveListener(filePath: string): Promise<void>;
    requestReload(): Promise<void>;
    browsePath(): Promise<Uri | undefined>;
    locateKeyLocation(key: string, workspaceSettingsUri: string, logger: Logger): Promise<void>;
}

export interface NixEnvironmentPicker {
    selectAndSaveEnvironment(): Promise<void>;
    autoLoadEnvironment(): boolean;
    activateInTerminal(terminal: Terminal, activationCommand: string): boolean;
    editCustomEnvVars(): Promise<void>;
    toggleTerminalAutoActivate(): Promise<void>;
    editTerminalAutoActivateCommand(): Promise<void>;
}