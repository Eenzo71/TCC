import express from 'express';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

router.post('/vincular-empresa', async (req, res) => {
  const { uid, empresa_id } = req.body;

  try {
    if (!uid || !empresa_id) {
      return res.status(400).json({ valido: false, erro: 'Dados incompletos.' });
    }

    await dbAdmin.collection('usuarios').doc(uid).set({
      empresa_id: empresa_id,
      status_vinculo: 'ativo',
      atualizado_em: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({ valido: true, mensagem: 'Vinculado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao vincular empresa:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao vincular.' });
  }
});

router.post('/desvincular-empresa', async (req, res) => {
  const { uid } = req.body;

  try {
    if (!uid) {
      return res.status(400).json({ valido: false, erro: 'UID não fornecido.' });
    }

    await dbAdmin.collection('usuarios').doc(uid).set({
      empresa_id: null,
      status_vinculo: null,
      atualizado_em: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({ valido: true, mensagem: 'Desvinculado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao desvincular empresa:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao desvincular.' });
  }
});

router.get('/status-vinculo/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await dbAdmin.collection('usuarios').doc(uid).get();
    if (!userDoc.exists || !userDoc.data().empresa_id) {
      return res.status(200).json({ vinculado: false });
    }
    return res.status(200).json({
      vinculado: true,
      empresa_id: userDoc.data().empresa_id
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao checar vínculo.' });
  }
});

export default router;