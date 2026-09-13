import express from 'express';
import { dbAdmin } from '../firebaseAdmin.js';

const router = express.Router();

router.post('/criar', async (req, res) => {
    const { empresa_id, nome, pontos } = req.body;

    try {
        if (!empresa_id || !nome || !pontos || pontos.length < 2) {
            return res.status(400).json({ valido: false, erro: 'Dados da rota incompletos.' });
        }

        const novaRota = {
            empresa_id,
            nome,
            pontos,
            data_criacao: new Date().toISOString()
        };

        const docRef = await dbAdmin.collection('rotas').add(novaRota);

        return res.status(201).json({ valido: true, id: docRef.id, mensagem: 'Rota criada com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao criar rota:', error);
        return res.status(500).json({ valido: false, erro: 'Erro interno ao salvar a rota.' });
    }
});

router.get('/:empresaId', async (req, res) => {
    const { empresaId } = req.params;

    try {
        const snapshot = await dbAdmin.collection('rotas').where('empresa_id', '==', empresaId).get();

        const rotas = [];
        snapshot.forEach(doc => {
            rotas.push({ id: doc.id, ...doc.data() });
        });

        return res.status(200).json(rotas);
    } catch (error) {
        console.error('❌ Erro ao buscar rotas:', error);
        return res.status(500).json({ erro: 'Erro interno.' });
    }
});

export default router;