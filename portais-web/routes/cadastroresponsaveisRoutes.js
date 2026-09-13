import CryptoJS from 'crypto-js';
import { dbAdmin, authAdmin } from '../firebaseAdmin.js';
import express from 'express';
import { validarCPF } from '../validations/validarCpf.js';
import { validarFormatoEmail } from '../validations/validarEmail.js';
import { validarSenha } from '../validations/validarSenha.js';
import { validarConfirmarSenha } from '../validations/validarConfirmarSenha.js';
import { validarCelular } from '../validations/validarCelular.js';
import { validarTelefoneEmergencia } from '../validations/validarTelefoneEmergencia.js';
import { validarCep } from '../validations/validarCep.js';
import { validarCoordenadas } from '../validations/validarCoordenadas.js';

const router = express.Router();


router.post('/validar-etapa1', async (req, res) => { 
    const { email, password, confirmPassword } = req.body;

    if (!validarFormatoEmail(email)) return res.status(400).json({ valido: false, erro: 'Formato de e-mail inválido.' });
    if (!validarSenha(password)) return res.status(400).json({ valido: false, erro: 'A senha deve ter pelo menos 6 caracteres.' });
    if (!validarConfirmarSenha(password, confirmPassword)) return res.status(400).json({ valido: false, erro: 'As senhas não coincidem.' });
    try {
        await authAdmin.getUserByEmail(email);
        return res.status(400).json({ valido: false, emailEmUso: true, erro: 'Este e-mail já está cadastrado.' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') { return res.status(200).json({ valido: true, mensagem: 'Credenciais válidas e e-mail livre!' }); }
        return res.status(500).json({ valido: false, erro: 'Erro interno ao verificar disponibilidade do e-mail.' });
    }
});


router.post('/validar-etapa2', (req, res) => {
    const { nome, cpf, celular, telefoneEmergencia } = req.body;
    if (!nome || nome.trim().length < 3) return res.status(400).json({ valido: false, erro: 'Preencha seu nome completo.' });
    if (!validarCPF(cpf)) return res.status(400).json({ valido: false, erro: 'CPF inválido.' });
    if (!validarCelular(celular)) return res.status(400).json({ valido: false, erro: 'Celular inválido.' });
    if (!validarTelefoneEmergencia(telefoneEmergencia)) return res.status(400).json({ valido: false, erro: 'Telefone de emergência incorreto.' });
    return res.status(200).json({ valido: true, mensagem: 'Dados pessoais ok!' });
});


router.post('/validar-etapa3', (req, res) => {
    const { cep, rua, numero, bairro, cidade, estado } = req.body;
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) return res.status(400).json({ valido: false, erro: 'Preencha todos os campos do endereço.' });
    if (!validarCep(cep)) return res.status(400).json({ valido: false, erro: 'CEP inválido.' });
    return res.status(200).json({ valido: true, mensagem: 'Endereço validado!' });
});


router.post('/validar-etapa4', (req, res) => {
    const { lat, lng } = req.body;
    if (!validarCoordenadas(lat, lng)) return res.status(400).json({ valido: false, erro: 'Coordenadas inválidas. Arraste o pino no mapa corretamente.' });
    return res.status(200).json({ valido: true, mensagem: 'Tudo OK! Pode ir pra cutscene e salvar no Firebase!' });
});

router.post('/finalizar', async (req, res) => {
    const { email, password, formData, empresaId } = req.body;

    try {
        if (!validarFormatoEmail(email) || !validarSenha(password)) throw new Error("Credenciais inválidas.");
        if (!validarCPF(formData.cpf)) throw new Error("CPF inválido.");
        if (!validarCelular(formData.celular)) throw new Error("Celular inválido.");
        if (!validarCep(formData.cep)) throw new Error("CEP inválido.");
        if (!validarCoordenadas(formData.lat, formData.lng)) throw new Error("Coordenadas inválidas.");

        const CHAVE = process.env.CHAVE_alululu || "H 83 nvykvmviph, 23 mluôtluv 9832 zvjphs 032 wyvmbukhtlual 77 luyhpghkv 551 lt 9 whkyõlz 64 lzaéapjvz 882 opzavypjhtlual 41 jvuzaybíkvz, 7 ylmslal 300 uãv 12 hwluhz 5 bth 98 xblzaãv 61 kl 4 hwhyêujph, ";
       
        const criptografar = (texto) => CryptoJS.AES.encrypt(texto || "", CHAVE).toString();
        const criptografarOpcional = (texto) => texto ? CryptoJS.AES.encrypt(texto, CHAVE).toString() : "";

        const dadosBlindados = {
            nome: formData.nome,
            cpf: criptografar(formData.cpf),
            celular: criptografar(formData.celular),
            telefoneEmergencia: criptografarOpcional(formData.telefoneEmergencia),
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
            tipo_perfil: "responsavel",
            empresa_vinculada: empresaId || null,
            data_cadastro: new Date().toISOString()
        };

        const userRecord = await authAdmin.createUser({ email, password });
        await dbAdmin.collection('usuarios').doc(userRecord.uid).set(dadosBlindados);

        return res.status(201).json({
            valido: true,
            mensagem: 'Conta criada e dados salvos com segurança máxima!'
        });

    } catch (error) {
        console.error('❌ Erro no fechamento do cadastro:', error);
        return res.status(400).json({ valido: false, erro: error.message });
    }
});


router.get('/empresa/:empresaId/alunos', async (req, res) => {
    const { empresaId } = req.params;

    try {
        let snapshot = await dbAdmin.collection('passageiros').where('empresa_id', '==', empresaId).get();

        if (snapshot.size === 0) {
            snapshot = await dbAdmin.collection('passageiros').where('empresa_vinculada', '==', empresaId).get();
        }

        const CHAVE = process.env.CHAVE_alululu;

        const descriptografar = (textoCifrado) => {
            if (!textoCifrado) return "";
            try {
                const bytes = CryptoJS.AES.decrypt(textoCifrado, CHAVE);
                return bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                return "";
            }
        };

        const listaAlunos = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            
            const latOriginal = data.endereco_embarque?.lat ? descriptografar(data.endereco_embarque.lat) : null;
            const lngOriginal = data.endereco_embarque?.lng ? descriptografar(data.endereco_embarque.lng) : null;

            if (latOriginal && lngOriginal) {
                listaAlunos.push({
                    id: doc.id,
                    nome: data.nome_passageiro || "Aluno Sem Nome", 
                    bairro: data.endereco_embarque?.bairro ? descriptografar(data.endereco_embarque.bairro) : "",
                    lat: Number(latOriginal),
                    lng: Number(lngOriginal)
                });
            }
        });

        return res.status(200).json(listaAlunos);

    } catch (error) {
        console.error('❌ Erro interno ao listar alunos para o mapa:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

export default router;