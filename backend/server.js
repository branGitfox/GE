const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config(); // Charger les variables d’environnement

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000; // Correction du port

// Configuration de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Remplacez par l'URL de votre frontend en production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware pour rendre io accessible dans les routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Endpoint pour l'upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier téléchargé');
  }
  res.status(200).send({ filename: req.file.filename });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Routes utilisateur
const userRoutes = require('./routes/userRoutes');
const authenticateToken = require('./middleware/authenticateToken');
app.use('/api/users', userRoutes);
const userRoutesLogin = require('./routes/userRoutesLogin');
app.use('/api/users', userRoutesLogin);
const userRoutesCRUD = require('./routes/userRoutesCRUD');
app.use('/api/users', authenticateToken, userRoutesCRUD);
const clientRoutes = require('./routes/ClientRoute');
app.use('/api/clients', authenticateToken, clientRoutes);
const factureRoutes = require('./routes/factureRoutes');
app.use('/api/factures', authenticateToken, factureRoutes);
const produitRoutes = require('./routes/ProduitRoutes');
app.use('/api', authenticateToken, produitRoutes);
const backupRoutes = require('./routes/backupRoutes');
app.use('/api/backup', backupRoutes);
const categorieRoutes = require('./routes/categorieRoutes');
app.use('/api/categories', authenticateToken, categorieRoutes);
const depenseRoutes = require('./routes/depenseRoutes');
app.use('/api/depenses', authenticateToken, depenseRoutes);
const produitAchatRoutes = require('./routes/produitAchatRoutes');
app.use('/api/produit-achat', authenticateToken, produitAchatRoutes);
const fournisseurRoutes = require('./routes/fournisseurRoutes');
app.use('/api/fournisseurs', authenticateToken, fournisseurRoutes);
const entrepotRoutes = require('./routes/entrepotRoutes');
app.use('/api/entrepots', authenticateToken, entrepotRoutes);
const exportRoutes = require('./routes/exportRoutes');
app.use('/api/export', exportRoutes);
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', authenticateToken, logRoutes);
const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', authenticateToken, roleRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).send("Désolé, cette route n'existe pas !");
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné !');
});

server.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://0.0.0.0:${port}`);
  console.log(`🟢 Socket.IO écoute sur ws://0.0.0.0:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 ERREUR CRITIQUE (uncaughtException):', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🌊 PROMESSE REJETÉE (unhandledRejection):', reason);
});
