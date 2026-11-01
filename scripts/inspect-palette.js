import fs from 'node:fs';

const appTxt = fs.readFileSync('public/app.js', 'utf8');
const cmdStart = appTxt.indexOf('const COMMAND_DIRECTORY = [');
const cmdEnd = appTxt.indexOf('];', cmdStart);
const cmdSlice = appTxt.slice(cmdStart, cmdEnd);

const entriesWithModal = [...cmdSlice.matchAll(/\{\s*"id":\s*"([^"]+)",[\s\S]*?"toolModal":\s*"([^"]+)"[\s\S]*?\}/g)];
console.log('Entries with toolModal:', entriesWithModal.length);
entriesWithModal.slice(0, 5).forEach(m => {
  console.log('---');
  console.log(m[0]);
});

// Also check action or handler when clicking a command
const selectCmdStart = appTxt.indexOf('function selectCommand(');
console.log('\nselectCommand logic:');
console.log(appTxt.slice(selectCmdStart, selectCmdStart + 800));
