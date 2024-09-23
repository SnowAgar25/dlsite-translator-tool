// src/config/index.ts

import { GM_getValue, GM_registerMenuCommand, GM_setValue } from '$';

// Default configuration
export const defaultConfig = {
    debug: true,
    modules: {
        navLink: {
            enabled: true,
        },
        previewBox: {
            enabled: true,
        },
        tracker: {
            enabled: true,
        },
    },
};

// Use the type of defaultConfig as our Config type
type Config = typeof defaultConfig;

// Load configuration
function loadConfig(): Config {
    const savedConfig = GM_getValue('userConfig', null);
    if (savedConfig) {
        return { ...defaultConfig, ...JSON.parse(savedConfig) };
    }
    return defaultConfig;
}

// Save configuration
function saveConfig(config: Config): void {
    GM_setValue('userConfig', JSON.stringify(config));
}

// Get configuration
export function getConfig(): Config {
    return loadConfig();
}

// Update configuration
export function updateConfig(newConfig: Partial<Config>): void {
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    saveConfig(updatedConfig);
}

// Get specific module configuration
export function getModuleConfig<T extends keyof Config['modules']>(
    moduleName: T
): Config['modules'][T] {
    const config = loadConfig();
    return config.modules[moduleName];
}

// Update specific module configuration
export function updateModuleConfig<T extends keyof Config['modules']>(
    moduleName: T,
    moduleConfig: Partial<Config['modules'][T]>
): void {
    const config = loadConfig();
    config.modules[moduleName] = { ...config.modules[moduleName], ...moduleConfig };
    saveConfig(config);
}

// Export the config object directly
export const config: Config = loadConfig();

// Update the config object when changes are made
export function refreshConfig(): void {
    Object.assign(config, loadConfig());
}

export function registerSettingsMenu() {
    GM_registerMenuCommand('設置', () => {
        const settingsUrl = 'https://github.com/SnowAgar25/dlsite-translator-tool';
        window.open(settingsUrl, '_blank');
    });
}