import express from 'express';
import CryptoJS from 'crypto-js';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

router.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const docSnap = await dbAdmin.collection('empresas').doc(uid).get();
    if (!docSnap.exists) {
      return res.status(404).json({ valido: false, erro: 'Empresa não encontrada.' });
    }

    const bd = docSnap.data();
    const CHAVE = process.env.CHAVE_alululu;

    const desc = (textoCifrado) => {
      if (!textoCifrado) return "";
      if (textoCifrado === 'Isento') return "Isento";
      try {
        const bytes = CryptoJS.AES.decrypt(textoCifrado, CHAVE);
        return bytes.toString(CryptoJS.enc.Utf8) || "";
      } catch (e) {
        return "";
      }
    };

    const formData = {
      porteEmpresa: bd.porteEmpresa || (bd.isentoCNPJ ? 'Autônomo' : 'MEI'),
      nomeAutonomo: desc(bd.nomeAutonomo),
      cpfAutonomo: desc(bd.cpfAutonomo),
      dataNascimentoAutonomo: desc(bd.dataNascimentoAutonomo),
      
      razaoSocial: bd.razaoSocial || '',
      nomeFantasia: bd.nomeFantasia || '',
      cnpj: desc(bd.cnpj),
      naturezaJuridica: bd.naturezaJuridica || '',
      dataAbertura: bd.dataAbertura || '',
      inscricaoEstadual: desc(bd.inscricaoEstadual),
      inscricaoMunicipal: desc(bd.inscricaoMunicipal),
      cnaePrincipal: bd.cnaePrincipal || '',
      cnaeSecundario: bd.cnaeSecundario || '',
      segmento: bd.segmento || '',
      descricaoAtividade: bd.descricaoAtividade || '',

      cep: desc(bd.endereco?.cep),
      pais: desc(bd.endereco?.pais) || 'Brasil',
      logradouro: desc(bd.endereco?.logradouro) || desc(bd.endereco?.rua),
      numero: desc(bd.endereco?.numero),
      complemento: desc(bd.endereco?.complemento),
      bairro: desc(bd.endereco?.bairro),
      cidade: desc(bd.endereco?.cidade),
      estado: desc(bd.endereco?.estado),

      numFuncionarios: bd.numFuncionarios || '',
      horarioFuncionamento: bd.horarioFuncionamento || '',
      filiais: bd.filiais || '',
      areaAtuacao: bd.areaAtuacao || '',

      tipoTransporte: bd.tipoTransporte || 'Van',
      capacidadeTotal: bd.capacidadeTotal || '',
      possuiMonitor: bd.possuiMonitor || 'Não',
      turnos: bd.turnos || '',

      telFixoEmpresa: desc(bd.telFixoEmpresa),
      telWhatsEmpresa: desc(bd.telWhatsEmpresa),
      telFixoGaragem: desc(bd.telFixoGaragem),
      telWhatsGaragem: desc(bd.telWhatsGaragem),
      emailPrincipal: desc(bd.emailPrincipal),
      emailFinanceiro: desc(bd.emailFinanceiro),
      siteOficial: bd.siteOficial || '',
      instagram: bd.instagram || '',
      facebook: bd.facebook || '',
      linkedin: bd.linkedin || '',

      respNome: desc(bd.responsavelLegal?.nome),
      respCargo: desc(bd.responsavelLegal?.cargo),
      respCpf: desc(bd.responsavelLegal?.cpf),
      respRg: desc(bd.responsavelLegal?.rg),
      respDataNascimento: desc(bd.responsavelLegal?.dataNascimento),
      respTelefone: desc(bd.responsavelLegal?.telefonePessoal) || desc(bd.telefone),
      respEmail: desc(bd.responsavelLegal?.emailPessoal),

      perguntaSeguranca: desc(bd.perguntaSeguranca),
      respostaSeguranca: desc(bd.respostaSeguranca),
    };

    return res.status(200).json({ valido: true, formData });
  } catch (error) {
    console.error('❌ Erro ao resgatar dossiê:', error);
    return res.status(500).json({ valido: false, erro: 'Erro interno ao buscar dossiê.' });
  }
});

export default router;