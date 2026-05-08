// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import cadastrorespRoutes from './routes/cadastroresponsaveisRoutes.js';
import passageiroRoutes from './routes/passageiroRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';
import motoristaRoutes from './routes/motoristaRoutes.js';

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/api/cadastro', cadastrorespRoutes);
app.use('/api/passageiros', passageiroRoutes);

app.use('/api/empresa', empresaRoutes);
app.use('/api/motorista', motoristaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor Back-end BusGap rodando na porta ${PORT}`);
});