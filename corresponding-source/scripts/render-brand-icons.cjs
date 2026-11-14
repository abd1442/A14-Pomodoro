// Render original SVG build assets only; no app/database is opened.
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
app.disableHardwareAcceleration();
app.setPath('userData',path.resolve('out/qa-temp/a14-brand-renderer'));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1024,height:1024,show:false,transparent:true,webPreferences:{offscreen:true,sandbox:true,contextIsolation:true,nodeIntegration:false}});
 const painted=new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Icon renderer did not produce a frame.')),10000);
  win.webContents.on('paint',(_event,_dirty,image)=>{if(image.isEmpty())return;clearTimeout(timeout);resolve(image)});
 });
 const svg=fs.readFileSync('resources/a14-pomodoro-icon.svg','utf8');
 await win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(`<style>html,body{margin:0;width:1024px;height:1024px;overflow:hidden;background:transparent}svg{width:1024px;height:1024px;display:block}</style>${svg}`));
 const image=await painted;
 fs.writeFileSync('resources/a14-pomodoro-icon.png',image.toPNG());
 for(const size of [16,20,24,32,40,48,64,128,256])fs.writeFileSync(`docs/branding/a14-pomodoro/approved-icon-${size}.png`,image.resize({width:size,height:size,quality:'best'}).toPNG());
 console.log('Rendered approved 1024px icon and nine Windows icon previews.');
 win.destroy();app.quit();
}).catch(error=>{console.error(error);app.exit(1)});
