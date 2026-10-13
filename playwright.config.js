import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 use:{baseURL:'http://127.0.0.1:5173',viewport:{width:390,height:844},launchOptions:{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}},
 webServer:[
  {command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},
  {command:'npm run build && python3 -m http.server 4174 --bind 127.0.0.1 --directory dist',url:'http://127.0.0.1:4174',reuseExistingServer:false}
 ]
});
