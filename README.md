# 📦 GEAR Doações - Sistema de Registro de Doações

Este é um aplicativo web para registrar doações de itens e dinheiro, feito para o projeto GEAR (Grupo Escoteiro do Ar Salgado Filho). O sistema inclui autenticação de administrador, upload de fotos e leitura de dados de doações diretamente de planilhas do Google Sheets via `opensheet.vercel.app`.

## 🛠 Tecnologias Utilizadas

- HTML5 + CSS3 (Glassmorphism UI)
- JavaScript (ES6+)
- Node.js
- Express.js
- Google Sheets + OpenSheet API (como banco de dados remoto)
- Fetch API

## 🔗 Integrações

- **OpenSheet**: Converte planilhas públicas do Google Sheets em endpoints JSON acessíveis por API.
- **Google Sheets**: Utilizado como fonte de dados para doações de itens e dinheiro.

## ⚙️ Como executar localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org) instalado

### 2. Instalação

```bash
git clone https://github.com/seu-usuario/gear-doacoes.git
cd gear-doacoes
npm install


### 1. Pré-requisitos

- Node.js instalado (https://nodejs.org)

### 2. Instalação

```bash
git clone https://github.com/seu-usuario/gear-doacoes.git
cd gear-doacoes
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto com os seguintes campos:

```bash
SHEET_ID_1=seu_id_da_planilha_de_itens
SHEET_ID_2=seu_id_da_planilha_de_dinheiro
```
    As planilhas devem estar públicas para leitura via OpenSheet.

### 4. Execução
No terminal, digite:

```
npm start
```

O servidor será iniciado em http://localhost:3000.

# 📁 Estrutura de Pastas

    /public: Frontend (HTML/CSS/JS)

    /uploads: Fotos enviadas por usuários

    /routes: Rotas da API

    server.js: Servidor principal (Express)

Doadores podem enviar imagens de suas doações, que serão exibidas em uma galeria rotativa na página principal.
💡 Observações

    Todos os dados são carregados diretamente das planilhas — não há necessidade de banco de dados tradicional como MongoDB ou MySQL.

    A galeria e os dados de progresso são atualizados automaticamente conforme as planilhas forem modificadas.

📬 Contribuições

Contribuições são bem-vindas! Basta abrir um Pull Request ou criar uma Issue com sugestões.
