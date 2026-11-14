import {it,expect} from 'vitest'
import {mkdtempSync,writeFileSync,readFileSync,rmSync,renameSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {StudyPublisher,StudySubscriber} from '../main/coachSync'
const wait=async(check:()=>boolean,timeout=7000):Promise<void>=>{const until=Date.now()+timeout;while(!check()){if(Date.now()>until)throw new Error('Local sync did not converge.');await new Promise(resolve=>setTimeout(resolve,30))}}
it('acknowledges changes and catches up after reopening without changing source records',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'coach-link-')),file=join(dir,'example.db');writeFileSync(file,'one')
  let publisher=new StudyPublisher(file);let received='',reads=0
  const reader=async()=>{received=readFileSync(file,'utf8');reads++;return true}
  let subscriber=new StudySubscriber(file,reader)
  try{
    publisher.start();subscriber.start();await wait(()=>publisher.status().state==='synced')
    expect(received).toBe('one');expect(readFileSync(file,'utf8')).toBe('one')
    writeFileSync(file,'corrected');publisher.notify();await wait(()=>received==='corrected'&&publisher.status().state==='synced')
    expect(reads).toBeGreaterThanOrEqual(2)
    subscriber.stop();writeFileSync(file,'changed while Coach was closed');publisher.notify()
    await wait(()=>publisher.status().state==='waiting')
    subscriber=new StudySubscriber(file,reader);subscriber.start();await wait(()=>received==='changed while Coach was closed'&&publisher.status().state==='synced')
    writeFileSync(join(dir,'replacement.db'),'restored database');renameSync(join(dir,'replacement.db'),file)
    await wait(()=>received==='restored database'&&publisher.status().state==='synced')
    const previousInstance=JSON.parse(readFileSync(file+'.coach-sync.json','utf8')).instance
    publisher.stop();publisher=new StudyPublisher(file);publisher.start();await wait(()=>publisher.status().state==='synced')
    expect(JSON.parse(readFileSync(file+'.coach-ack.json','utf8')).instance).not.toBe(previousInstance)
    const marker=readFileSync(file+'.coach-sync.json','utf8');expect(marker).not.toContain('restored database')
  }finally{subscriber.stop();publisher.stop();rmSync(dir,{recursive:true,force:true})}
},15000)
it('retries unreadable data, never acknowledges a failed read and coalesces changes during a read',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'coach-link-')),file=join(dir,'example.db');writeFileSync(file,'source')
  const publisher=new StudyPublisher(file);let available=false,running=0,maxRunning=0,reads=0
  const subscriber=new StudySubscriber(file,async()=>{running++;maxRunning=Math.max(maxRunning,running);reads++;await new Promise(resolve=>setTimeout(resolve,60));running--;return available})
  try{publisher.start();subscriber.start();await wait(()=>subscriber.status().state==='error');expect(publisher.status().state).toBe('waiting');available=true
    await wait(()=>publisher.status().state==='synced')
    for(let i=0;i<20;i++)subscriber.request()
    await wait(()=>publisher.status().state==='synced');expect(maxRunning).toBe(1);expect(reads).toBeLessThan(6)
  }finally{subscriber.stop();publisher.stop();rmSync(dir,{recursive:true,force:true})}
},15000)
