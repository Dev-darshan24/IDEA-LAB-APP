const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '..', 'data', 'updates.json');

function testPersistentStore() {
  console.log('--- TESTING PERSISTENT UPDATES STORE ---');
  console.log('File path:', DATA_FILE_PATH);
  
  if (fs.existsSync(DATA_FILE_PATH)) {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const items = JSON.parse(raw);
    console.log('Successfully read persistent updates. Total count:', items.length);
    items.forEach((item, i) => {
      console.log(`[${i + 1}] ID: ${item.id} | Title: "${item.title}"`);
    });
  } else {
    console.error('File does not exist!');
  }
}

testPersistentStore();
