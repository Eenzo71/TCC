import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawUid = req.body.uid || 'empresa';
    const safeUid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '');
    const extensao = file.originalname.split('.').pop().toLowerCase();
    
    const nomeUnico = `panfleto_${safeUid}_${Date.now()}.${extensao}`;
    cb(null, nomeUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem (JPEG, PNG ou WEBP) são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

router.post('/logo', upload.single('imagem'), async (req, res) => {
  const { uid, tipo } = req.body;
  const file = req.file;

  try {
    if (!uid) return res.status(400).json({ valido: false, erro: 'ID da empresa não fornecido.' });
    if (!file) return res.status(400).json({ valido: false, erro: 'Nenhuma imagem válida foi enviada.' });
    if (!tipo || !['capa', 'fundo'].includes(tipo)) return res.status(400).json({ valido: false, erro: 'Tipo de imagem inválido (deve ser capa ou fundo).' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const linkDaImagem = `${baseUrl}/uploads/${file.filename}`;

    const campoAlvo = tipo === 'capa' ? 'imagem_capa' : 'imagem_fundo';

    await dbAdmin.collection('empresas').doc(uid).set({
      [campoAlvo]: linkDaImagem
    }, { merge: true });

    return res.status(200).json({
      valido: true,
      mensagem: `Imagem de ${tipo} atualizada com sucesso!`,
      url: linkDaImagem,
      tipo: tipo
    });

  } catch (error) {
    console.error('❌ ERRO NO UPLOAD:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ valido: false, erro: 'Erro interno ao processar a imagem.' });
  }
});

export default router;