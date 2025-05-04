const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.static('.'));

// Endpoint to save data
app.post('/save-data', async (req, res) => {
    try {
        await fs.writeFile('data.json', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

const os = require('os');
const PORT = process.env.PORT || 3000;

// Função para descobrir o IP local automaticamente
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`✅ Server running at: http://${localIP}:${PORT}`);
});
