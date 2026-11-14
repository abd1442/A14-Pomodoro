import {watch,statSync,readFileSync,writeFileSync,renameSync,unlinkSync,type FSWatcher} from 'node:fs'
import {basename,dirname} from 'node:path'
import {randomUUID} from 'node:crypto'

/** Local protocol v1. Signals carry no study text and never modify the SQLite database. */
export interface StudySignal {version:1;producer:'a14-pomodoro';instance:string;revision:number;updatedAt:string;changedAt:string;online:boolean}
export interface StudyAck {version:1;instance:string;revision:number;checkedAt:string}
export interface StudySyncStatus {state:'synced'|'waiting'|'offline'|'error';auto:true;producerOnline:boolean;lastSyncAt?:string;changedAt?:string;revision?:number;message?:string}
const signalPath=(file:string)=>file+'.coach-sync.json',ackPath=(file:string)=>file+'.coach-ack.json'
function json(file:string):any{try{if(statSync(file).size>4096)return;return JSON.parse(readFileSync(file,'utf8'))}catch{return}}
function signal(file:string):StudySignal|undefined{const value=json(signalPath(file));return value?.version===1&&value.producer==='a14-pomodoro'&&typeof value.instance==='string'&&value.instance.length<100&&Number.isSafeInteger(value.revision)&&value.revision>=0&&Number.isFinite(Date.parse(value.updatedAt))&&Number.isFinite(Date.parse(value.changedAt))&&typeof value.online==='boolean'?value:undefined}
function atomic(file:string,value:unknown):void{const temp=file+'.'+process.pid+'.tmp';try{writeFileSync(temp,JSON.stringify(value),'utf8');renameSync(temp,file)}finally{try{unlinkSync(temp)}catch{}}}
const fresh=(at:string,now:number)=>now-Date.parse(at)>=-5000&&now-Date.parse(at)<45000
const stamp=(file:string):string=>[file,file+'-wal',file+'-journal'].map(path=>{try{const s=statSync(path);return`${s.ino}:${s.size}:${s.mtimeMs}:${s.ctimeMs}`}catch{return'-'}}).join('|')
const unref=(timer:NodeJS.Timeout):NodeJS.Timeout=>{timer.unref();return timer}

/** Pomodoro publishes revisions; Coach acknowledges only a successful read of that revision. */
export class StudyPublisher {
  private watcher?:FSWatcher;private timer?:NodeJS.Timeout;private debounce?:NodeJS.Timeout
  private disposed=false;private signature='';private lastHeartbeat=0;private problem?:string
  private current:StudySignal
  constructor(private file:string,private changed:()=>void=()=>{}){const at=new Date().toISOString();this.current={version:1,producer:'a14-pomodoro',instance:randomUUID(),revision:0,updatedAt:at,changedAt:at,online:true}}
  start():void{if(this.timer)return;this.signature=stamp(this.file);this.publish(false);this.attach();this.timer=unref(setInterval(()=>this.check(),2000))}
  private attach():void{if(this.watcher||this.disposed)return;try{this.watcher=watch(dirname(this.file),(_event,name)=>{if(!name)return;const file=String(name);if(file===basename(ackPath(this.file))){this.changed();return}if([basename(this.file),basename(this.file)+'-wal',basename(this.file)+'-journal'].includes(file))this.notify()});this.watcher.on('error',()=>{this.watcher?.close();this.watcher=undefined})}catch{}}
  notify():void{if(this.disposed||this.debounce)return;this.debounce=unref(setTimeout(()=>{this.debounce=undefined;this.signature=stamp(this.file);this.publish(true)},180))}
  private publish(change:boolean):void{const at=new Date().toISOString();this.current={...this.current,revision:this.current.revision+Number(change),updatedAt:at,...(change?{changedAt:at}:{}),online:!this.disposed};try{atomic(signalPath(this.file),this.current);this.problem=undefined;this.lastHeartbeat=Date.now()}catch{this.problem='Could not publish the local sync signal. Coach can still watch the database.'}this.changed()}
  private check():void{this.attach();const next=stamp(this.file);if(next!==this.signature){this.signature=next;this.publish(true)}else if(Date.now()-this.lastHeartbeat>=12000)this.publish(false);this.changed()}
  status(now=Date.now()):StudySyncStatus{const ack=json(ackPath(this.file)),valid=ack?.version===1&&ack.instance===this.current.instance&&ack.revision===this.current.revision&&typeof ack.checkedAt==='string'&&fresh(ack.checkedAt,now);return{state:this.problem?'error':valid?'synced':'waiting',auto:true,producerOnline:!this.disposed,lastSyncAt:valid?ack.checkedAt:undefined,changedAt:this.current.changedAt,revision:this.current.revision,message:this.problem}}
  stop():void{if(this.disposed)return;this.disposed=true;if(this.timer)clearInterval(this.timer);if(this.debounce)clearTimeout(this.debounce);this.watcher?.close();this.publish(false)}
}

/** Debounced filesystem events, periodic reconciliation and a full reread after every restart. */
export class StudySubscriber {
  private watcher?:FSWatcher;private timer?:NodeJS.Timeout;private debounce?:NodeJS.Timeout
  private disposed=false;private reading=false;private pending=false;private signature='';private lastRead=0
  private statusValue:StudySyncStatus={state:'waiting',auto:true,producerOnline:false}
  constructor(private file:string,private refresh:()=>Promise<boolean>,private changed:()=>void=()=>{}){}
  start():void{if(this.timer)return;this.attach();this.request();this.timer=unref(setInterval(()=>this.check(),2000))}
  private attach():void{if(this.watcher||this.disposed)return;try{this.watcher=watch(dirname(this.file),(_event,name)=>{if(!name)return;const filename=String(name);if([basename(this.file),basename(this.file)+'-wal',basename(this.file)+'-journal',basename(signalPath(this.file))].includes(filename))this.request()});this.watcher.on('error',()=>{this.watcher?.close();this.watcher=undefined})}catch{}}
  private sourceStamp():string{const s=signal(this.file);return stamp(this.file)+'|'+(s?`${s.instance}:${s.revision}:${s.updatedAt}:${s.online}`:'none')}
  request():void{if(this.disposed)return;this.pending=true;if(this.reading||this.debounce)return;this.debounce=unref(setTimeout(()=>{this.debounce=undefined;void this.read()},220))}
  private async read():Promise<void>{if(this.disposed||this.reading)return;this.reading=true;this.pending=false;const before=this.sourceStamp(),source=signal(this.file);let success=false
    try{success=await this.refresh()}catch{}
    if(this.disposed){this.reading=false;return}
    const current=this.sourceStamp();this.signature=current;this.lastRead=Date.now()
    const online=!!source?.online&&fresh(source.updatedAt,Date.now())
    let problem:string|undefined
    if(success&&source&&before===current){try{atomic(ackPath(this.file),{version:1,instance:source.instance,revision:source.revision,checkedAt:new Date().toISOString()} satisfies StudyAck)}catch{problem='Study records refreshed, but Pomodoro could not be acknowledged.'}}
    this.statusValue={state:!success||problem?'error':before!==current?'waiting':'synced',auto:true,producerOnline:online,lastSyncAt:success?new Date().toISOString():this.statusValue.lastSyncAt,changedAt:source?.changedAt,revision:source?.revision,message:problem??(!success?'Waiting to read study data. Retrying automatically.':undefined)}
    if(before!==current)this.pending=true
    this.reading=false;this.changed();if(this.pending)this.request()
  }
  private check():void{this.attach();if(this.sourceStamp()!==this.signature||this.statusValue.state==='error'||Date.now()-this.lastRead>=15000)this.request()}
  status():StudySyncStatus{return{...this.statusValue}}
  stop():void{this.disposed=true;if(this.timer)clearInterval(this.timer);if(this.debounce)clearTimeout(this.debounce);this.watcher?.close()}
}
