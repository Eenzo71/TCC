import express from 'express';
import CryptoJS from 'crypto-js';
import { dbAdmin, authAdmin } from '../firebaseAdmin.js';

import { validarFormatoEmail } from '../validations/validarEmail.js';
import { validarSenha } from '../validations/validarSenha.js';
import { validarConfirmarSenha } from '../validations/validarConfirmarSenha.js';
import { validarCPF } from '../validations/validarCpf.js';
import { validarMaiorIdade } from '../validations/validarDataNascimento.js';
import { validarCep } from '../validations/validarCep.js';

const router = express.Router();

// validação por etapa

router.post('/validar-etapa1', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!validarFormatoEmail(email)) return res.status(400).json({ valido: false, erro: 'Formato de e-mail inválido.' });
  if (!validarSenha(password)) return res.status(400).json({ valido: false, erro: 'A senha deve ter pelo menos 6 caracteres.' });
  if (!validarConfirmarSenha(password, confirmPassword)) return res.status(400).json({ valido: false, erro: 'As senhas não coincidem.' });

  try {
    await authAdmin.getUserByEmail(email);
    return res.status(400).json({ valido: false, erro: 'Este e-mail já está em uso no sistema.' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ valido: true, mensagem: 'E-mail livre!' });
    }
    return res.status(500).json({ valido: false, erro: 'Erro interno ao verificar o e-mail.' });
  }
});

router.post('/validar-etapa2', (req, res) => {
  const { nome, cpf, dataNascimento, celular } = req.body;
  
  if (!nome || nome.length < 3) return res.status(400).json({ valido: false, erro: 'Preencha seu nome completo.' });
  if (!validarCPF(cpf)) return res.status(400).json({ valido: false, erro: 'CPF inválido.' });
  if (!validarMaiorIdade(dataNascimento)) return res.status(400).json({ valido: false, erro: 'Você precisa ter 18 anos ou mais para este perfil.' });
  
  const telLimpo = String(celular || '').replace(/\D/g, '');
  if (telLimpo.length < 10) return res.status(400).json({ valido: false, erro: 'Número de celular inválido.' });

  return res.status(200).json({ valido: true, mensagem: 'Dados pessoais aprovados!' });
});

router.post('/validar-etapa3', (req, res) => {
  const { cep, estado, cidade, bairro, rua, numero } = req.body;
  
  if (!cep || !estado || !cidade || !bairro || !rua || !numero) {
    return res.status(400).json({ valido: false, erro: 'Preencha todos os campos obrigatórios do endereço.' });
  }
  if (!validarCep(cep)) return res.status(400).json({ valido: false, erro: 'CEP inválido.' });
  
  return res.status(200).json({ valido: true, mensagem: 'Endereço OK!' });
});

// escolas por Cidade
router.get('/escolas-por-cidade', async (req, res) => {
  try {
    const { cidade, estado } = req.query;
    if (!cidade || !estado) return res.status(400).json({ valido: false, erro: 'Cidade e Estado obrigatórios.' });

    const empresasSnapshot = await dbAdmin.collection('empresas').get();
    let escolasEncontradas = [];

    // O ideal no futuro é buscar direto por indexação, mas por enquanto varremos as empresas
    empresasSnapshot.forEach(doc => {
      const dadosEmpresa = doc.data();
      if (dadosEmpresa.escolas_atendidas && dadosEmpresa.escolas_atendidas.length > 0) {
        const escolasDessaEmpresa = dadosEmpresa.escolas_atendidas.map(escola => ({
          nome: escola.nome,
          turmas: escola.turmas,
          empresa_id: doc.id
        }));
        escolasEncontradas.push(...escolasDessaEmpresa);
      }
    });

    return res.status(200).json({ valido: true, escolas: escolasEncontradas });
  } catch (error) {
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar escolas.' });
  }
});

router.post('/cadastrar-maior', async (req, res) => {
  const { email, senha, tipo_cadastro, dados_pessoais, endereco, dados_escolares, empresa_id } = req.body;

  try {
    if (!validarFormatoEmail(email) || !validarSenha(senha)) {
      throw new Error("Credenciais inválidas.");
    }
    if (!validarCPF(dados_pessoais.cpf)) {
      throw new Error("CPF inválido detectado no fechamento.");
    }
    if (!validarCep(endereco.cep)) {
      throw new Error("CEP de embarque inválido.");
    }
    if (!validarMaiorIdade(dados_pessoais.dataNascimento)) {
      throw new Error("Acesso negado: O passageiro precisa ter 18 anos completos ou mais.");
    }

    const CHAVE = process.env.CHAVE_SECRETA_BANCO || "alululu";
    const criptografar = (texto) => texto ? CryptoJS.AES.encrypt(String(texto), CHAVE).toString() : "";

    const userRecord = await authAdmin.createUser({
      email: email,
      password: senha,
      displayName: dados_pessoais.nome
    });
    
    const dadosPassageiro = {
      nome_passageiro: dados_pessoais.nome,
      cpf_passageiro: criptografar(dados_pessoais.cpf),
      data_nascimento: criptografar(dados_pessoais.dataNascimento),
      telefone: criptografar(dados_pessoais.telefone),
      telefone_emergencia: criptografar(dados_pessoais.telefone_emergencia),
      
      tipo_cadastro: tipo_cadastro,
      responsavel_id: userRecord.uid, 
      empresa_id: empresa_id || null,
      
      dados_escolares: dados_escolares ? {
        instituicao: dados_escolares.instituicao,
        turma: dados_escolares.turma,
        pendente_revisao: dados_escolares.pendente_revisao,
        matricula: criptografar(dados_escolares.matricula) 
      } : null,
      
      endereco_embarque: {
        cep: criptografar(endereco.cep),
        estado: criptografar(endereco.estado),
        cidade: criptografar(endereco.cidade), 
        bairro: criptografar(endereco.bairro),
        rua: criptografar(endereco.rua),
        numero: criptografar(endereco.numero),
        complemento: criptografar(endereco.complemento),
        lat: criptografar(endereco.lat),
        lng: criptografar(endereco.lng)
      },
      
      data_registro: new Date().toISOString()
    };

    await dbAdmin.collection('passageiros').doc(userRecord.uid).set(dadosPassageiro);

    return res.status(201).json({ valido: true, mensagem: 'Passageiro cadastrado com segurança!' });

  } catch (error) {
    console.error('❌ Erro finalização passageiro:', error);
    return res.status(400).json({ valido: false, erro: error.message || 'Erro interno ao criar a conta.' });
  }
});

// cadastrar dependente
router.post('/cadastrar-dependente', async (req, res) => {
  const { responsavel_id, empresa_id, nome, dataNascimento, instituicao, turma, turmaManual, matricula, email_app, senha_app } = req.body;

  try {
    if (!responsavel_id || !nome || !dataNascimento || !instituicao || !email_app || !senha_app) {
      return res.status(400).json({ valido: false, erro: 'Preencha todos os campos obrigatórios.' });
    }

    const CHAVE = process.env.CHAVE_SECRETA_BANCO || "alululu";
    const criptografar = (texto) => texto ? CryptoJS.AES.encrypt(String(texto), CHAVE).toString() : "";

    const turmaFinal = turma === 'outra' ? turmaManual : turma;
    const precisaRevisao = turma === 'outra';

    const userRecord = await authAdmin.createUser({
      email: email_app,
      password: senha_app,
      displayName: nome
    });

    const dadosDependente = {
      nome_passageiro: nome,
      data_nascimento: criptografar(dataNascimento),
      tipo_cadastro: 'dependente', 
      responsavel_id: responsavel_id,
      empresa_id: empresa_id || null,
      
      dados_escolares: {
        instituicao: instituicao,
        turma: turmaFinal,
        pendente_revisao: precisaRevisao,
        matricula: criptografar(matricula) 
      },
      
      status_conta: "pendente", 
      data_registro: new Date().toISOString()
    };

    await dbAdmin.collection('passageiros').doc(userRecord.uid).set(dadosDependente);

    return res.status(201).json({ 
      valido: true, 
      mensagem: 'Dependente adicionado com sucesso e acesso ao App Mobile liberado!' 
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar dependente:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ valido: false, erro: 'Este e-mail de acesso já está em uso.' });
    }
    return res.status(500).json({ valido: false, erro: 'Erro interno ao salvar o passageiro.' });
  }
});

// descobre o usuário
router.get('/perfil/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    let doc = await dbAdmin.collection('passageiros').doc(uid).get();
    if (doc.exists) {
      return res.status(200).json({ valido: true, tipo: doc.data().tipo_cadastro });
    }

    doc = await dbAdmin.collection('usuarios').doc(uid).get();
    if (doc.exists) {
      return res.status(200).json({ valido: true, tipo: doc.data().tipo_perfil });
    }

    doc = await dbAdmin.collection('empresas').doc(uid).get();
    if (doc.exists) {
      return res.status(200).json({ valido: true, tipo: doc.data().tipo_perfil || 'empresa' });
    }

    return res.status(404).json({ valido: false, erro: 'Perfil não encontrado em nenhuma base.' });

  } catch (error) {
    console.error("❌ Erro ao buscar perfil mestre:", error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar perfil.' });
  }
});

export default router;