const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🎯 On définit le dossier de manière absolue et on le nettoie
const UPLOAD_BASE = path.join(process.cwd(), 'uploads');
const ATTEST_PATH = path.join(UPLOAD_BASE, 'attestations');

// CONFIGURATION MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🛡️ SÉCURITÉ MAXIMALE : On recrée les dossiers juste avant d'écrire !
    if (!fs.existsSync(UPLOAD_BASE)) fs.mkdirSync(UPLOAD_BASE);
    if (!fs.existsSync(ATTEST_PATH)) fs.mkdirSync(ATTEST_PATH);
    
    console.log("📍 Multer écrit ici :", ATTEST_PATH);
    cb(null, ATTEST_PATH);
  },
  filename: (req, file, cb) => {
    // Nom simple : doc-chiffres.pdf
    cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// ROUTES
router.post('/register', upload.single('document_preuve'), authController.register);
router.post('/login', authController.login);
router.get('/user/:id', authController.getUserInfo);

module.exports = router;