import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'DLsite 譯者工具 檢查作品翻譯狀態',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=dlsite.com',
        namespace: 'https://github.com/SnowAgar25',
        match: ['https://*.dlsite.com/*'],
        description: '當滑鼠對準任何含有RJ號href的物件時，將顯示一個預覽框，顯示翻譯報酬和申請情況',
        'run-at': 'document-start',  // 在文檔開始時運行腳本
        license: 'MIT'
      },
    }),
  ],
});
