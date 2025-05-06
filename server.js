const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// CSP primeiro
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "connect-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self';"
  );
  
  next();
});

// Depois os outros middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));



// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Definir o esquema de doações
const DonationSchema = new mongoose.Schema({
  nome: String,
  item: String,
  quantidade: Number,
  data: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', DonationSchema);

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

// Rota para salvar doação no banco
app.post('/save-data', async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar no MongoDB:', error);
    res.status(500).json({ error: 'Erro ao salvar no banco' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server online na porta ${PORT}`);
});
