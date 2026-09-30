import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import cadastrorespRoutes from './routes/cadastroresponsaveisRoutes.js';
import passageiroRoutes from './routes/passageiroRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';
import motoristaRoutes from './routes/motoristaRoutes.js';
import completarPerfilRoutes from './routes/completarPerfilRoutes.js';
import vincDesvincRoutes from './routes/vinc-desvincRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import rotasRoutes from './routes/rotasRoutes.js';

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/cadastro', cadastrorespRoutes);
app.use('/api/passageiros', passageiroRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/motorista', motoristaRoutes);
app.use('/api/dossie', completarPerfilRoutes);
app.use('/api/usuario', vincDesvincRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rotas', rotasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Back na porta:${PORT}`);
});