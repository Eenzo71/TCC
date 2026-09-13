import { dbAdmin, authAdmin } from '../firebaseAdmin.js';
import express from 'express';

import { validarCPF } from '../validations/validarCpf.js';
import { validarCNH } from '../validations/validarCnh.js';
import { validarPlaca } from '../validations/validarPlaca.js';

const router = express.Router();

router.post('/cadastrar', async (req, res) => {
  const { empresa_id, nome, email, senha, placa, veiculo, cpf, cnh } = req.body;

  try {
    if (!empresa_id || !nome || !email || !senha || !placa || !veiculo || !cpf || !cnh) {
      return res.status(400).json({ valido: false, erro: 'Preencha todos os campos do formulário.' });
    }

    if (!validarCPF(cpf)) return res.status(400).json({ valido: false, erro: 'CPF inválido. Verifique a digitação.' });
    if (!validarCNH(cnh)) return res.status(400).json({ valido: false, erro: 'CNH inválida. Digite um número real.' });
    if (!validarPlaca(placa)) return res.status(400).json({ valido: false, erro: 'Placa inválida. Use o formato ABC-1234 ou Mercosul.' });

    const userRecord = await authAdmin.createUser({
      email: email,
      password: senha,
      displayName: nome
    });

    const dadosMotorista = {
      nome: nome,
      email: email,
      placa: String(placa).toUpperCase().replace('-', ''),
      veiculo: veiculo,
      empresa_id: empresa_id,
      cpf: cpf.replace(/[^\d]+/g, ''), 
      cnh: cnh.replace(/[^\d]+/g, ''),
      tipo_perfil: 'motorista',
      status: 'offline',
      data_cadastro: new Date().toISOString()
    };

    await dbAdmin.collection('motoristas').doc(userRecord.uid).set(dadosMotorista);

    return res.status(201).json({ 
      valido: true, 
      mensagem: 'Conta criada! O motorista já pode logar no App Mobile.' 
    });

  } catch (error) {
    console.error('❌ Erro no cadastro do motorista:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ valido: false, erro: 'Este e-mail de acesso já está em uso.' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ valido: false, erro: 'A senha do app deve ter pelo menos 6 caracteres.' });
    }

    return res.status(500).json({ valido: false, erro: 'Erro interno ao criar a conta no servidor.' });
  }
});

router.put('/atualizar/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, veiculo, placa, email, cpf, cnh } = req.body;

  try {
    if (cpf && !validarCPF(cpf)) return res.status(400).json({ valido: false, erro: 'CPF inválido.' });
    if (cnh && !validarCNH(cnh)) return res.status(400).json({ valido: false, erro: 'CNH inválida.' });
    if (placa && !validarPlaca(placa)) return res.status(400).json({ valido: false, erro: 'Placa inválida.' });

    const updateData = { nome, veiculo, email };
    if (placa) updateData.placa = String(placa).toUpperCase().replace('-', '');
    if (cpf) updateData.cpf = cpf.replace(/[^\d]+/g, '');
    if (cnh) updateData.cnh = cnh.replace(/[^\d]+/g, '');

    await dbAdmin.collection('motoristas').doc(id).update(updateData);

    return res.status(200).json({ valido: true, mensagem: 'Motorista atualizado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao atualizar motorista:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao atualizar motorista.' });
  }
});

router.delete('/deletar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ valido: false, erro: 'ID do motorista não fornecido.' });
    }

    await dbAdmin.collection('motoristas').doc(id).delete();

    return res.status(200).json({ valido: true, mensagem: 'Motorista removido da frota com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao deletar motorista:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao tentar remover o motorista.' });
  }
});

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