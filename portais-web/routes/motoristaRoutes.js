// routes/motoristaRoutes.js
import express from 'express';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

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