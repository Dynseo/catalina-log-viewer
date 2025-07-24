// server/tail-server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Tail } from 'tail';
import dotenv from 'dotenv';
import basicAuth from 'basic-auth';
import cors from 'cors';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const __dirname = path.resolve();

const USERS = {
  [process.env.ADMINUSERNAME]: process.env.ADMINPASSWORD,
};

// Vérifier les variables d'environnement
if (!process.env.ADMINUSERNAME || !process.env.ADMINPASSWORD) {
  console.error('Les variables ADMINUSERNAME et ADMINPASSWORD ne sont pas définies.');
  process.exit(1);
}

// Activer CORS en premier (très important pour les requêtes avec auth)
app.use(cors({
  origin: ['http://localhost:5173'], // Ajout des origines autorisées
  credentials: true, // Permet l'envoi de credentials
  methods: ['GET', 'POST', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers autorisés
}));

// Middleware Auth HTTP basique (après CORS)
app.use((req, res, next) => {
  // Permettre les requêtes OPTIONS (preflight) de passer sans auth
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const user = basicAuth(req);
  console.log('Reçu:', user.name, user.pass, USERS[user.name], process.env.ADMINUSERNAME, process.env.ADMINPASSWORD);
  if (!user || USERS[user.name] !== user.pass) {
    res.set('WWW-Authenticate', 'Basic realm="logs"');
    return res.status(401).send('Authentication required.');
  }
  next();
});

// Middleware pour servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../client/dist')));

// Route pour servir le fichier index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
const LOG_PATH = process.env.LOG_PATH;

// Serve API pour historique (lecture partielle des logs)
app.get('/api/logs', async (req, res) => {
  const fs = await import('fs/promises');
  const logs = await fs.readFile(LOG_PATH, 'utf-8');
  res.json({ content: logs.split('\n').filter(Boolean) });
});

// WebSocket pour logs en direct
io.on('connection', (socket) => {
  console.log('Client connecté');

  const tail = new Tail(LOG_PATH, { fromBeginning: false });

  tail.on('line', (line) => {
    socket.emit('log', line);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
    tail.unwatch();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});
