import nodemailer from 'nodemailer';
import express from 'express';
import CryptoJS from 'crypto-js';
import { dbAdmin, authAdmin } from '../firebaseAdmin.js';

import { validarFormatoEmail } from '../validations/validarEmail.js';
import { validarSenha } from '../validations/validarSenha.js';
import { validarConfirmarSenha } from '../validations/validarConfirmarSenha.js';
import { validarCPF } from '../validations/validarCpf.js';
import { validarCep } from '../validations/validarCep.js';

import { validarRG } from '../validations/validarRg.js';
import { validarMaiorIdade } from '../validations/validarDataNascimento.js';
import { validarTelefoneFixo } from '../validations/validarTelefoneFixo.js';
import { validarCnae } from '../validations/validation-perfil-emprs/validarCnae.js';
import { validarDataAbertura } from '../validations/validation-perfil-emprs/validarDataAbertura.js';
import { validarTextoObrigatorio } from '../validations/validation-perfil-emprs/validarTextosEmpresa.js';

import { validarCNPJ } from '../validations/validation-perfil-emprs/validarCnpj.js';

const router = express.Router();

// planfeto

router.get('/convite/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const empresasRef = dbAdmin.collection('empresas');
    const snapshot = await empresasRef.where('slug_convite', '==', slug).get();

    if (snapshot.empty) {
      return res.status(404).json({ valido: false, erro: 'Link de convite inválido ou expirado.' });
    }

    const docEmpresa = snapshot.docs[0];
    const dadosEmpresa = docEmpresa.data();

    return res.status(200).json({
      valido: true,
      empresa: {
        id: docEmpresa.id,
        nomeFantasia: dadosEmpresa.nomeFantasia || dadosEmpresa.nome_fantasia || 'Empresa Parceira'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar convite:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao validar o convite.' });
  }
});

// cadastro

// login
router.post('/validar-etapa1', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!validarFormatoEmail(email)) return res.status(400).json({ valido: false, erro: 'Formato de e-mail inválido.' });
  if (!validarSenha(password)) return res.status(400).json({ valido: false, erro: 'A senha deve ter pelo menos 6 caracteres.' });
  if (!validarConfirmarSenha(password, confirmPassword)) return res.status(400).json({ valido: false, erro: 'As senhas não coincidem.' });

  try {
    await authAdmin.getUserByEmail(email);
    return res.status(400).json({ valido: false, emailEmUso: true, erro: 'E-mail corporativo já cadastrado.' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ valido: true, mensagem: 'E-mail livre e senha aprovada!' });
    }
    return res.status(500).json({ valido: false, erro: 'Erro interno de verificação.' });
  }
});

// juridico
router.post('/validar-etapa2', (req, res) => {
  const { razaoSocial, nomeFantasia, cnpj } = req.body;
  if (!razaoSocial || !nomeFantasia) return res.status(400).json({ valido: false, erro: 'Preencha a Razão Social e o Nome Fantasia.' });
  if (!validarCNPJ(cnpj)) return res.status(400).json({ valido: false, erro: 'CNPJ inválido. Verifique os números.' });
  return res.status(200).json({ valido: true, mensagem: 'Dados jurídicos aprovados!' });
});

// responsavel legal
router.post('/validar-etapa3', (req, res) => {
  const { nomeResponsavel, cpfResponsavel, telefoneEmpresa } = req.body;
  if (!nomeResponsavel) return res.status(400).json({ valido: false, erro: 'Preencha o nome do responsável.' });
  if (!validarCPF(cpfResponsavel)) return res.status(400).json({ valido: false, erro: 'CPF do responsável inválido.' });
  
  const telLimpo = String(telefoneEmpresa || '').replace(/\D/g, '');
  if (telLimpo.length < 10) return res.status(400).json({ valido: false, erro: 'O número de contato parece incorreto.' });
  
  return res.status(200).json({ valido: true, mensagem: 'Responsável validado!' });
});

// endereço
router.post('/validar-etapa4', (req, res) => {
  const { cep, estado, cidade, bairro, rua, numero } = req.body;
  if (!cep || !estado || !cidade || !bairro || !rua || !numero) {
    return res.status(400).json({ valido: false, erro: 'Preencha todos os campos do endereço da garagem.' });
  }
  if (!validarCep(cep)) return res.status(400).json({ valido: false, erro: 'CEP inválido.' });
  return res.status(200).json({ valido: true, mensagem: 'Endereço OK!' });
});


router.post('/finalizar', async (req, res) => {
  const { email, password, formData } = req.body;

  try {
    if (!validarFormatoEmail(email) || !validarSenha(password)) throw new Error("Credenciais inválidas.");
    if (!validarCNPJ(formData.cnpj)) throw new Error("CNPJ inválido.");
    if (!validarCPF(formData.cpfResponsavel)) throw new Error("CPF do responsável inválido.");
    if (!validarCep(formData.cep)) throw new Error("CEP inválido.");

    const CHAVE = process.env.CHAVE_SECRETA_BANCO || "alululu";
    const criptografar = (texto) => CryptoJS.AES.encrypt(String(texto || ""), CHAVE).toString();
    const criptografarOpcional = (texto) => texto ? CryptoJS.AES.encrypt(String(texto), CHAVE).toString() : "";

    const slugConvite = String(formData.nomeFantasia).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const dadosBlindados = {
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia, 
      cnpj: criptografar(formData.cnpj),
      responsavelLegal: {
        nome: criptografar(formData.nomeResponsavel),
        cpf: criptografar(formData.cpfResponsavel)
      },
      telefone: criptografar(formData.telefoneEmpresa),
      endereco: {
        cep: criptografar(formData.cep),
        estado: criptografar(formData.estado),
        cidade: criptografar(formData.cidade),
        bairro: criptografar(formData.bairro),
        rua: criptografar(formData.rua),
        numero: criptografar(formData.numero),
        complemento: criptografarOpcional(formData.complemento),
        lat: criptografar(formData.lat),
        lng: criptografar(formData.lng)
      },
      tipo_perfil: "empresa",
      slug_convite: slugConvite,
      
      data_cadastro: new Date().toISOString(),
      perfil_completo: false,
      termos_aceitos: true,
      codigo_2fa: "" 
    };

    const userRecord = await authAdmin.createUser({ email, password });
    await dbAdmin.collection('empresas').doc(userRecord.uid).set(dadosBlindados);

    return res.status(201).json({ 
      valido: true, 
      mensagem: 'Conta corporativa criada e dados blindados com sucesso!' 
    });

  } catch (error) {
    console.error('❌ Erro no fechamento do cadastro da empresa:', error);
    return res.status(400).json({ valido: false, erro: error.message });
  }
});

// 2FA login
router.post('/solicitar-2fa', async (req, res) => {
  const { uid, email } = req.body;

  try {
    const codigoSeguranca = Math.floor(100000 + Math.random() * 900000).toString();

    await dbAdmin.collection('empresas').doc(uid).update({ 
      codigo_2fa: codigoSeguranca 
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // manda email
    await transporter.sendMail({
      from: `"Segurança BusGap" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Seu código de acesso BusGap 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f4f4f9;">
          <h2 style="color: #111;">Acesso Corporativo BusGap</h2>
          <p style="color: #555; font-size: 16px;">Você solicitou um código para entrar no painel da empresa.</p>
          <div style="margin: 30px auto; padding: 20px; background: #fff; border-radius: 10px; border: 2px dashed #4caf50; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">
            ${codigoSeguranca}
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">Se você não tentou fazer login, altere sua senha imediatamente.</p>
        </div>
      `
    });

    return res.status(200).json({ valido: true, mensagem: 'Código gerado e enviado!' });

  } catch (error) {
    console.error('❌ Erro no 2FA:', error);
    return res.status(500).json({ valido: false, erro: 'Falha interna ao processar o 2FA.' });
  }
});

// verifica se ta certo
router.post('/verificar-2fa', async (req, res) => {
  const { uid, codigoDigitado } = req.body;

  try {
    const docEmpresa = await dbAdmin.collection('empresas').doc(uid).get();
    
    if (!docEmpresa.exists) {
      return res.status(404).json({ valido: false, erro: 'Empresa não encontrada.' });
    }

    const codigoReal = docEmpresa.data().codigo_2fa;

    if (codigoReal && codigoDigitado === codigoReal) {
      await dbAdmin.collection('empresas').doc(uid).update({ codigo_2fa: "" });
      return res.status(200).json({ valido: true, mensagem: 'Acesso liberado!' });
    } else {
      return res.status(400).json({ valido: false, erro: 'Código inválido ou expirado.' });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar código:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao validar o código.' });
  }
});

// completar perfil
router.post('/completar-perfil', async (req, res) => {
  const { uid, dadosPerfil } = req.body;

  try {
    if (!uid || !dadosPerfil) throw new Error("Dados do dossiê ausentes.");

    const porte = dadosPerfil.porteEmpresa;

    // validação geral
    if (!validarMaiorIdade(dadosPerfil.respDataNascimento)) throw new Error("O responsável legal precisa ter 18 anos ou mais.");
    if (!validarRG(dadosPerfil.respRg)) throw new Error("RG do responsável inválido.");
    if (!validarTelefoneFixo(dadosPerfil.telFixoEmpresa)) throw new Error("O telefone fixo informado é inválido.");

    // validação condicional
    if (porte === 'Autônomo') {
        // autonomo
        if (!validarTextoObrigatorio(dadosPerfil.nomeAutonomo, 3)) throw new Error("O nome do motorista é obrigatório.");
        if (!validarCPF(dadosPerfil.cpfAutonomo)) throw new Error("O CPF do motorista é inválido.");
    } else {
        // MEI, ME, EPP, LTDA
        if (!validarCNPJ(dadosPerfil.cnpj)) throw new Error("CNPJ inválido detectado no servidor.");
        if (!validarDataAbertura(dadosPerfil.dataAbertura)) throw new Error("A data de abertura da empresa não pode ser no futuro.");
        if (!validarTextoObrigatorio(dadosPerfil.razaoSocial, 3)) throw new Error("A Razão Social é obrigatória.");
        if (!validarTextoObrigatorio(dadosPerfil.nomeFantasia, 2)) throw new Error("O Nome Fantasia é obrigatório.");
        
        if (porte !== 'MEI') {
            if (!validarCnae(dadosPerfil.cnaePrincipal)) throw new Error("O CNAE Principal deve ter exatamente 7 números.");
            if (!validarTextoObrigatorio(dadosPerfil.naturezaJuridica, 3)) throw new Error("A Natureza Jurídica é obrigatória para este porte de empresa.");
        }
    }

    // criptografia...
    const CHAVE = process.env.CHAVE_SECRETA_BANCO || "alululu";
    const criptografar = (texto) => texto ? CryptoJS.AES.encrypt(String(texto), CHAVE).toString() : "";

    // dossie
    const dossieBlindado = {
        // identificação
        porteEmpresa: porte,
        
        ...(porte === 'Autônomo' ? {
            nomeAutonomo: criptografar(dadosPerfil.nomeAutonomo),
            cpfAutonomo: criptografar(dadosPerfil.cpfAutonomo),
            dataNascimentoAutonomo: criptografar(dadosPerfil.dataNascimentoAutonomo),
        } : {
            razaoSocial: dadosPerfil.razaoSocial,
            nomeFantasia: dadosPerfil.nomeFantasia,
            cnpj: criptografar(dadosPerfil.cnpj),
            naturezaJuridica: dadosPerfil.naturezaJuridica,
            dataAbertura: dadosPerfil.dataAbertura,
            inscricaoEstadual: criptografar(dadosPerfil.inscricaoEstadual),
            inscricaoMunicipal: criptografar(dadosPerfil.inscricaoMunicipal),
            cnaePrincipal: dadosPerfil.cnaePrincipal,
            cnaeSecundario: dadosPerfil.cnaeSecundario,
            segmento: dadosPerfil.segmento,
            descricaoAtividade: dadosPerfil.descricaoAtividade,
        }),

        // endereço
        "endereco.cep": criptografar(dadosPerfil.cep),
        "endereco.logradouro": criptografar(dadosPerfil.logradouro),
        "endereco.numero": criptografar(dadosPerfil.numero),
        "endereco.complemento": criptografar(dadosPerfil.complemento),
        "endereco.bairro": criptografar(dadosPerfil.bairro),
        "endereco.cidade": criptografar(dadosPerfil.cidade),
        "endereco.estado": criptografar(dadosPerfil.estado),
        "endereco.pais": criptografar(dadosPerfil.pais),

        // operacional
        tipoTransporte: dadosPerfil.tipoTransporte,
        capacidadeTotal: dadosPerfil.capacidadeTotal,
        possuiMonitor: dadosPerfil.possuiMonitor,
        turnos: dadosPerfil.turnos,
        numFuncionarios: dadosPerfil.numFuncionarios,
        horarioFuncionamento: dadosPerfil.horarioFuncionamento,
        filiais: dadosPerfil.filiais,
        areaAtuacao: dadosPerfil.areaAtuacao,
        
        // contatos
        telFixoEmpresa: criptografar(dadosPerfil.telFixoEmpresa),
        telWhatsEmpresa: criptografar(dadosPerfil.telWhatsEmpresa),
        telFixoGaragem: criptografar(dadosPerfil.telFixoGaragem),
        telWhatsGaragem: criptografar(dadosPerfil.telWhatsGaragem),
        emailPrincipal: criptografar(dadosPerfil.emailPrincipal),
        emailFinanceiro: criptografar(dadosPerfil.emailFinanceiro),
        siteOficial: dadosPerfil.siteOficial,
        instagram: dadosPerfil.instagram,
        facebook: dadosPerfil.facebook,
        linkedin: dadosPerfil.linkedin,

        // responsavel legal
        "responsavelLegal.rg": criptografar(dadosPerfil.respRg),
        "responsavelLegal.dataNascimento": criptografar(dadosPerfil.respDataNascimento),
        "responsavelLegal.cargo": criptografar(dadosPerfil.respCargo),
        "responsavelLegal.telefonePessoal": criptografar(dadosPerfil.respTelefone),
        "responsavelLegal.emailPessoal": criptografar(dadosPerfil.respEmail),
        
        perguntaSeguranca: criptografar(dadosPerfil.perguntaSeguranca),
        respostaSeguranca: criptografar(dadosPerfil.respostaSeguranca),

        // docs
        documentosEnviados: dadosPerfil.documentos,
        perfil_completo: true
    };

    await dbAdmin.collection('empresas').doc(uid).update(dossieBlindado);

    return res.status(200).json({ 
      valido: true, 
      mensagem: 'Dossiê salvo, validado e blindado com sucesso!' 
    });

  } catch (error) {
    console.error('❌ Erro de Validação no Dossiê:', error);
    return res.status(400).json({ 
      valido: false, 
      erro: error.message || 'Erro interno ao processar o dossiê.' 
    });
  }
});

router.get('/:id/escolas', async (req, res) => {
  try {
    const { id } = req.params;
    
    // pega as empresa no firestone
    const empresaDoc = await dbAdmin.collection('empresas').doc(id).get();

    if (!empresaDoc.exists) {
      return res.status(404).json({ valido: false, erro: 'Empresa não encontrada no banco de dados.' });
    }

    const dados = empresaDoc.data();
    
    //se não tiver escolas atendidas, retorna array vazio
    const escolas = dados.escolas_atendidas || [];

    return res.status(200).json({ 
      valido: true, 
      escolas: escolas 
    });

  } catch (error) {
    console.error("Erro interno ao buscar escolas da empresa:", error);
    return res.status(500).json({ valido: false, erro: 'Erro interno no servidor ao tentar ler as instituições.' });
  }
});

export default router;