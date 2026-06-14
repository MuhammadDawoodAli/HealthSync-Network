const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 0; // Random available port

app.use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(port, () => {
  const actualPort = server.address().port;
  console.log(`HealthSync-Network is running at http://localhost:${actualPort}`);
  console.log('Opening browser...');
  
  if (process.platform === 'win32') {
    exec(`start http://localhost:${actualPort}`);
  } else if (process.platform === 'darwin') {
    exec(`open http://localhost:${actualPort}`);
  } else {
    exec(`xdg-open http://localhost:${actualPort}`);
  }
});
