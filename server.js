const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CSP primeiro
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "connect-src 'self' https://opensheet.vercel.app; " + // <- libera acesso à API
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self';"
  );
  next();
});

// Outros middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Esquema de doações
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

// Rota para salvar doação no MongoDB
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


// ✅ Rota: Lê duas planilhas diferentes via opensheet.vercel.app
app.get('/dados-planilha', async (req, res) => {
  const sheetID1 = process.env.SHEET_ID_1; // Planilha de itens
  const sheetID2 = process.env.SHEET_ID_2; // Planilha de doações em dinheiro
  const aba = 1; // ou use o nome da aba (ex: 'Página1')

  const url1 = `https://opensheet.vercel.app/${sheetID1}/${aba}`;
  const url2 = `https://opensheet.vercel.app/${sheetID2}/${aba}`;

  try {
    const [res1, res2] = await Promise.all([
      axios.get(url1),
      axios.get(url2)
    ]);

    res.json({
      itens: res1.data,
      dinheiro: res2.data
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados das planilhas:', error);
    res.status(500).json({ error: 'Erro ao buscar uma ou mais planilhas' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server online na porta ${PORT}`);
});
