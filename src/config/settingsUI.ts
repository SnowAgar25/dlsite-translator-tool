// src/config/settingsUI.ts

import { getConfig, updateConfig, refreshConfig, defaultConfig } from './index';
type Config = typeof defaultConfig;

interface SettingField {
    type: 'checkbox' | 'select';
    label: string;
    key: string;
    options?: { value: string; label: string }[];
    html: (field: SettingField) => string;
}

const settingsStructure: Record<string, SettingField[]> = {
    '設置': [
        {
            type: 'checkbox',
            label: 'Debug模式',
            key: 'debug',
            html: (field) => `
        <div class="option">
          <label>
            <input type="checkbox" class="checkbox" id="${field.key}">
            <span>${field.label}</span>
          </label>
        </div>
      `
        },
        {
            type: 'checkbox',
            label: '跳轉按鈕：「翻訳許可作品」&「翻訳申請」',
            key: 'modules.navLink.enabled',
            html: (field) => `
        <div class="option">
          <label>
            <input type="checkbox" class="checkbox" id="${field.key}">
            <span>${field.label}</span>
          </label>
        </div>
      `
        },
        {
            type: 'checkbox',
            label: '預覽框：顯示作品報酬和翻譯狀態',
            key: 'modules.previewBox.enabled',
            html: (field) => `
        <div class="option">
          <label>
            <input type="checkbox" class="checkbox" id="${field.key}">
            <span>${field.label}</span>
          </label>
        </div>
      `
        },
        {
            type: 'checkbox',
            label: '追蹤功能：作品翻譯狀態',
            key: 'modules.tracker.enabled',
            html: (field) => `
        <div class="option">
          <label>
            <input type="checkbox" class="checkbox" id="${field.key}">
            <span>${field.label}</span>
          </label>
        </div>
      `
        },
    ],
};

const styles = `
  <style>
    .settings { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #6D92FF; }
    .settings h3 { font-size: 18px; margin-bottom: 10px; }
    .option { margin-bottom: 10px; }
    .option label { display: flex; align-items: center; cursor: pointer; }
    .option select { padding: 8px; border-radius: 5px; border: 1px solid #6D92FF; color: #6D92FF; background-color: white; font-size: 14px; margin-top: 5px; }
    hr { border: 0; height: 1px; background-color: #6D92FF; margin: 20px 0; opacity: 0.3; }
    button { background-color: #6D92FF; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; transition: opacity 0.3s; }
    button:hover { opacity: 0.8; }
    .checkbox { -webkit-appearance: none; -moz-appearance: none; appearance: none; width: 20px; height: 20px; border: 2px solid #6D92FF; border-radius: 4px; outline: none; transition: all 0.3s; position: relative; cursor: pointer; margin-right: 10px; background-color: white; }
    .checkbox:checked { background-color: #6D92FF; }
    .checkbox:checked::after { content: ''; position: absolute; left: 50%; top: 50%; width: 25%; height: 50%; border: solid white; border-width: 0 2px 2px 0; transform: translate(-50%, -60%) rotate(45deg); }
    .checkbox:focus { box-shadow: 0 0 0 2px rgba(39, 94, 254, 0.3); }
  </style>
`;

function generateSettingsHTML(): string {
    let html = styles + '<div class="settings">';

    for (const [section, fields] of Object.entries(settingsStructure)) {
        html += `<h2>${section}</h2>`;
        fields.forEach(field => {
            html += field.html(field);
        });
        html += '<hr>';
    }

    html += `
      <button id="save-settings">Save Settings</button>
    </div>
  `;

    return html;
}

function injectSettingsUI() {
    const targetElement = document.querySelector('.markdown-heading');
    if (targetElement) {
        targetElement.insertAdjacentHTML('afterend', generateSettingsHTML());
        initializeSettings();
    }
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const lastObj = keys.reduce((prev, curr) => prev[curr] = prev[curr] || {}, obj);
    lastObj[lastKey] = value;
}

function initializeSettings() {
    const config = getConfig();

    Object.values(settingsStructure).flat().forEach(field => {
        const element = document.getElementById(field.key) as HTMLInputElement | HTMLSelectElement;
        if (element) {
            const value = getNestedValue(config, field.key);
            if (field.type === 'checkbox') {
                (element as HTMLInputElement).checked = value;
            } else if (field.type === 'select') {
                (element as HTMLSelectElement).value = value;
            }
        }
    });

    document.getElementById('save-settings')?.addEventListener('click', saveSettings);
}

function saveSettings() {
    const newConfig: Partial<Config> = {};

    Object.values(settingsStructure).flat().forEach(field => {
        const element = document.getElementById(field.key) as HTMLInputElement | HTMLSelectElement;
        if (element) {
            const value = field.type === 'checkbox'
                ? (element as HTMLInputElement).checked
                : (element as HTMLSelectElement).value;
            setNestedValue(newConfig, field.key, value);
        }
    });

    updateConfig(newConfig);
    refreshConfig();
    alert('Settings saved successfully!');
}

export function initSettingsUI() {
    if (window.location.href.startsWith('https://github.com/SnowAgar25/dlsite-translator-tool')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectSettingsUI);
        } else {
            injectSettingsUI();
        }
    }
}