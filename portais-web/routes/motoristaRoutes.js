// routes/motoristaRoutes.js
import express from 'express';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

// Iniciar a rota (Cria a viagem no banco)
router.post('/iniciar-viagem', async (req, res) => {
  const { motorista_id, empresa_id } = req.body;
  try {
    const novaViagem = await dbAdmin.collection('viagens').add({
      motorista_id,
      empresa_id,
      status: 'ativa',
      horario_inicio: new Date().toISOString(),
      horario_fim: null
    });
    res.status(201).json({ viagem_id: novaViagem.id });
  } catch (e) { res.status(500).send(e.message); }
});

// Registrar ponto na linha do tempo
router.post('/registrar-ponto', async (req, res) => {
  const { viagem_id, lat, lng } = req.body;
  try {
    await dbAdmin.collection('viagens').doc(viagem_id)
      .collection('rastreamento').add({
        lat, lng, timestamp: new Date().toISOString()
      });
    res.status(200).send("Ponto registrado");
  } catch (e) { res.status(500).send(e.message); }
});

// recebe o sinal do GPS do app mobile
router.post('/atualizar-localizacao', async (req, res) => {
  const { uid, lat, lng, velocidade, timestamp } = req.body;

  try {
    if (!uid || lat === undefined || lng === undefined) {
      return res.status(400).json({ valido: false, erro: 'Dados de GPS incompletos ou corrompidos.' });
    }

    const dadosGps = {
      localizacao_atual: {
        lat: Number(lat),
        lng: Number(lng),
        velocidade: Number(velocidade) || 0,
        ultima_atualizacao: timestamp || Date.now()
      }
    };

    // { merge: true } para APENAS atualizar a localização ai não apaga os dados que o motorista já tem, mas acho que tem jeito melhor de fazer isso >>> verificar depois
    await dbAdmin.collection('motoristas').doc(uid).set(dadosGps, { merge: true });

    console.log(`📡 SINAL RECEBIDO! Motorista: ${uid} | Lat: ${lat} | Lng: ${lng}`);

    return res.status(200).json({ 
      valido: true, 
      mensagem: '📍 Coordenada salva no radar com sucesso!' 
    });

  } catch (error) {
    console.error('❌ Erro no Radar:', error);
    return res.status(500).json({ 
      valido: false, 
      erro: 'Falha interna ao processar o sinal do GPS.' 
    });
  }
});

export default router;