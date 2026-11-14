const fs=require('node:fs'),path=require('node:path');
const base=path.resolve('docs/branding/a14-pomodoro/simple-badges');
for(const [source,target] of [['1-icon.svg','a14-pomodoro-icon.svg'],['1-light.svg','a14-pomodoro-lockup.svg'],['1-dark.svg','a14-pomodoro-lockup-dark.svg']]){
 let svg=fs.readFileSync(path.join(base,source),'utf8').replace(/aria-label="[^"]*"/,'aria-label="A14 Pomodoro"');
 // Icon-only lettering: 32 source units high, centred, with about seven units
 // of clearance from the gold stroke. Larger than the original 24-unit master
 // without the cramped 38-unit variant's near-touching right edge.
 // Keep the full wordmark's original proportions in the sidebar and About art.
 if(source==='1-icon.svg')svg=svg.replace('translate(26.828864892803036 40) scale(0.3378144419052059)','translate(18.47 36.02) scale(0.45)');
 fs.writeFileSync(path.resolve('resources',target),svg);
}
console.log('Exported approved Countdown Corner vector icon and light/dark lockups.');
