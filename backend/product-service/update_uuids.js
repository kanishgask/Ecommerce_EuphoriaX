const fs = require('fs');
const { v4 } = require('uuid');

let data = fs.readFileSync('seed.js', 'utf8');
data = data.replace(/id:\s*'\d+'/g, () => `id: '${v4()}'`);
fs.writeFileSync('seed.js', data);
console.log('Successfully updated seed.js with UUIDs');
