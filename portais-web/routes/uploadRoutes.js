import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { dbAdmin } from '../firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/logo', upload.single('imagem'), async (req, res) => {
  const { uid } = req.body;
  const file = req.file;

  try {
    if (!uid || !file) {
      return res.status(400).json({ valido: false, erro: 'Usuário ou imagem não enviados.' });
    }

    const extensao = file.originalname.split('.').pop();
    const nomeArquivo = `logo_${uid}_${Date.now()}.${extensao}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('busgap-branding')
      .upload(nomeArquivo, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase
      .storage
      .from('busgap-branding')
      .getPublicUrl(nomeArquivo);

    const linkDaImagem = urlData.publicUrl;

    await dbAdmin.collection('empresas').doc(uid).update({
      imagem_login: linkDaImagem
    });

    return res.status(200).json({
      valido: true,
      mensagem: 'Logo personalizada com sucesso!',
      url: linkDaImagem
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao salvar a imagem.' });
  }
});

export default router;