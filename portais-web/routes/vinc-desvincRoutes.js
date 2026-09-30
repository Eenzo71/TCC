import express from 'express';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

router.post('/vincular-empresa', async (req, res) => {
  const { uid, empresa_id, dados_escolares } = req.body;

  try {
    if (!uid || !empresa_id) {
      return res.status(400).json({ valido: false, erro: 'Dados incompletos.' });
    }

    await dbAdmin.collection('usuarios').doc(uid).set({
      empresa_id: empresa_id,
      status_vinculo: 'ativo',
      dados_escolares: dados_escolares || null,
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

router.get('/escola/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const docSnap = await dbAdmin.collection('usuarios').doc(uid).get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ valido: false, erro: 'Usuário não encontrado' });
    }
    
    const dados = docSnap.data();
    const escola = dados.dados_escolares?.instituicao || dados.escola || 'Não informada';
    
    return res.status(200).json({ valido: true, escola });
  } catch (error) {
    console.error('❌ Erro ao buscar escola:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar escola.' });
  }
});

router.get('/turma/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const docSnap = await dbAdmin.collection('usuarios').doc(uid).get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ valido: false, erro: 'Usuário não encontrado' });
    }
    
    const dados = docSnap.data();
    const turma = dados.dados_escolares?.turma || dados.turma || 'Não informada';
    
    return res.status(200).json({ valido: true, turma });
  } catch (error) {
    console.error('❌ Erro ao buscar turma:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar turma.' });
  }
});

router.get('/matricula/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const docSnap = await dbAdmin.collection('usuarios').doc(uid).get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ valido: false, erro: 'Usuário não encontrado' });
    }
    
    const dados = docSnap.data();
    const matricula = dados.dados_escolares?.matricula || dados.matricula || 'Não informada';
    
    return res.status(200).json({ valido: true, matricula });
  } catch (error) {
    console.error('❌ Erro ao buscar matrícula:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar matrícula.' });
  }
});

export default router;