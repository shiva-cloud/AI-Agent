// scripts/debug-conv.js
import {createApp} from '../src/server.js';
import {openStore} from '../src/store.js';

const store = openStore();
const server = createApp(store, 'test-token');
server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/v1/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'What documents do I need to bring?',
      previousContext: {
        topic: 'sin',
        city: 'Toronto',
        at: new Date().toISOString()
      }
    })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', data);
  server.close();
  store.db.close();
});
