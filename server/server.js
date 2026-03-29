require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/db');
const Message = require('./models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Déclaré une seule fois ici
const dbPassword = process.env.DB_PASS;


const app = express();
const server = http.createServer(app);

// ==========================================
// CONFIGURATION SOCKET.IO
// ==========================================
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "DELETE"],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Utilisateur connecté au chat:', socket.id);

  socket.on('join_room', (rendezVousId) => {
    const roomId = `room_${rendezVousId}`;
    socket.join(roomId);
    console.log(`👤 Socket ${socket.id} a rejoint : ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = await Message.create({
        contenu: data.contenu,
        expediteur_id: data.expediteur_id,
        rendez_vous_id: data.rendez_vous_id,
        lu: false
      });

      const [result] = await sequelize.query(
        `SELECT m.*, u.nom as nom_expediteur 
          FROM messages m
          JOIN users u ON m.expediteur_id = u.id
          WHERE m.id = ?`,
        { replacements: [newMessage.id], type: sequelize.QueryTypes.SELECT }
      );

      io.to(`room_${data.rendez_vous_id}`).emit('receive_message', result[0]);
      
    } catch (error) {
      console.error("❌ Erreur socket send_message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Utilisateur déconnecté');
  });
});

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
// Cette ligne doit être présente après tes middlewares (cors, json)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ==========================================
// CONFIGURATION DE L'UPLOAD (MULTER)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});



// ==========================================
// IMPORT DE TOUTES LES ROUTES
// ==========================================
const authRoutes = require('./routes/authRoutes');
const medecinRoutes = require('./routes/medecinRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const favoriRoutes = require('./routes/favoriRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const avisRoutes = require('./routes/avisRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ==========================================
// UTILISATION DES ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/medecins', medecinRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const notificationRoutes = require('./routes/notificationRoutes');

// ==========================================
// ROUTES API MESSAGES
// ==========================================
app.get('/api/messages/:rendezVousId', async (req, res) => {
  try {
    const rdvId = req.params.rendezVousId;
    const messages = await sequelize.query(
      `SELECT m.*, u.nom as nom_expediteur 
        FROM messages m
        JOIN users u ON m.expediteur_id = u.id
        WHERE m.rendez_vous_id = ?
        ORDER BY m.createdAt ASC`,
      { replacements: [rdvId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, messages: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { contenu, expediteur_id, rendez_vous_id } = req.body;
    const newMessage = await Message.create({
      contenu, expediteur_id, rendez_vous_id, lu: false
    });
    const [result] = await sequelize.query(
      `SELECT m.*, u.nom as nom_expediteur 
        FROM messages m
        JOIN users u ON m.expediteur_id = u.id
        WHERE m.id = ?`,
      { replacements: [newMessage.id], type: sequelize.QueryTypes.SELECT }
    );
    io.to(`room_${rendez_vous_id}`).emit('receive_message', result);
    res.status(201).json({ success: true, message: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [msgData] = await sequelize.query(
      'SELECT rendez_vous_id FROM messages WHERE id = ?',
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
    );
    if (!msgData) return res.status(404).json({ message: "Message introuvable" });
    await Message.destroy({ where: { id } });
    io.to(`room_${msgData.rendez_vous_id}`).emit('message_deleted', id);
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// ROUTES DOCUMENTS
// ==========================================

const DocModel = require('./models/Document');
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Aucun fichier reçu." });
    const fileNameOriginal = req.file.originalname;
const fileNameSaved = req.file.filename; // Juste le nom : "1773184632077-doc.pdf"

await sequelize.query(
  `INSERT INTO documents (nom_original, chemin, patient_id, createdAt, updatedAt) 
   VALUES (?, ?, ?, NOW(), NOW())`,
  { replacements: [fileNameOriginal, fileNameSaved, patientId] } // On stocke fileNameSaved
);
    res.json({ success: true, message: "Fichier sauvegardé !", file: { nom: fileName, chemin: filePath } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/documents/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const documents = await sequelize.query(
      `SELECT * FROM documents WHERE patient_id = ? ORDER BY createdAt DESC`,
      { replacements: [patientId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [doc] = await sequelize.query(
      "SELECT chemin FROM documents WHERE id = ?",
      { replacements: [id], type: sequelize.QueryTypes.SELECT }
    );
    if (!doc) return res.status(404).json({ success: false, message: "Document introuvable." });

    if (fs.existsSync(doc.chemin)) {
      fs.unlinkSync(doc.chemin);
    }

    await sequelize.query("DELETE FROM documents WHERE id = ?", { replacements: [id] });
    res.json({ success: true, message: "Document supprimé avec succès !" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// DÉMARRAGE
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur Adil lancé sur port ${PORT}`);
});


// Route avec "/patient" (optionnel)
app.get('/api/documents/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const documents = await sequelize.query(
      `SELECT * FROM documents WHERE patient_id = ? ORDER BY createdAt DESC`,
      { replacements: [patientId], type: sequelize.QueryTypes.SELECT }
    );
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});