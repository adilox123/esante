require('dotenv').config();
const express = require('express');
const http = require('http'); // ✅ Ajouté pour Socket.io
const { Server } = require('socket.io'); // ✅ Ajouté pour Socket.io
const cors = require('cors');
const sequelize = require('./config/db'); 
const Message = require('./models/Message'); 

const app = express();
const server = http.createServer(app); // ✅ Crée le serveur HTTP avec Express

// ==========================================
// CONFIGURATION SOCKET.IO
// ==========================================
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // URL de votre Front-end
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Un utilisateur est connecté au chat :', socket.id);

  // Rejoindre une discussion spécifique à un RDV
  socket.on('join_room', (rendezVousId) => {
    socket.join(rendezVousId);
    console.log(`👤 Utilisateur a rejoint le salon : ${rendezVousId}`);
  });

  // Envoi d'un message
  socket.on('send_message', async (data) => {
    try {
      // Sauvegarde du message en BDD (Optionnel ici si fait via API, mais recommandé)
      // const newMessage = await Message.create(data);
      
      // Diffusion du message à tout le monde dans le salon du RDV
      io.to(data.rendez_vous_id).emit('receive_message', data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Utilisateur déconnecté');
  });
});

// ==========================================
// MIDDLEWARES GLOBAUX
// ==========================================
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ==========================================
// DÉCLARATION DES ROUTES
// ==========================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medecins', require('./routes/medecinRoutes'));
app.use('/api/favoris', require('./routes/favoriRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/absences', require('./routes/absenceRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// ✅ Route pour récupérer l'historique des messages (À créer dans un nouveau fichier de route plus tard)
app.get('/api/messages/:rendezVousId', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { rendez_vous_id: req.params.rendezVousId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DÉMARRAGE ET SYNCHRONISATION
// ==========================================
const PORT = process.env.PORT || 5000;

// Une seule synchronisation suffit
sequelize.sync({ alter: false }) // ✅ Changé à false pour éviter l'erreur de contrainte patients_ibfk_1
  .then(() => {
    console.log("✅ Base de données MySQL synchronisée !");
    // ⚠️ Utiliser 'server.listen' et non 'app.listen' pour Socket.io
    server.listen(PORT, () => {
      console.log(`🚀 Serveur E-Santé démarré sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur fatale lors de la synchronisation :", error);
  });