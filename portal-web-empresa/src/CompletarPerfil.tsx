import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import AbaIdentificacao from './complet-perfil/AbaIdentificacao';
import AbaOperacional from './complet-perfil/AbaOperacional';
import AbaContato from './complet-perfil/AbaContato';
import AbaResponsavel from './complet-perfil/AbaResponsavel';
import AbaDocumentos from './complet-perfil/AbaDocumentos';

interface CompletarPerfilProps {
    irParaPerfil: () => void;
}

export default function CompletarPerfil({ irParaPerfil }: CompletarPerfilProps) {
    const [abaAtual, setAbaAtual] = useState(1);
    const [carregando, setCarregando] = useState(false);

    // estados global
    const [formData, setFormData] = useState({
        porteEmpresa: 'Autônomo',
        nomeAutonomo: '', cpfAutonomo: '', dataNascimentoAutonomo: '',
        razaoSocial: '', nomeFantasia: '', cnpj: '', naturezaJuridica: '', dataAbertura: '',
        inscricaoEstadual: '', inscricaoMunicipal: '', cnaePrincipal: '', cnaeSecundario: '',
        segmento: '', descricaoAtividade: '',
        cep: '', pais: 'Brasil', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
        numFuncionarios: '', horarioFuncionamento: '', filiais: '', areaAtuacao: '',
        tipoTransporte: 'Van', capacidadeTotal: '', possuiMonitor: 'Não', turnos: '',
        telFixoEmpresa: '', telWhatsEmpresa: '', telFixoGaragem: '', telWhatsGaragem: '',
        emailPrincipal: '', emailFinanceiro: '', siteOficial: '', instagram: '', facebook: '', linkedin: '',
        respNome: '', respCargo: '', respCpf: '', respRg: '', respDataNascimento: '', respTelefone: '', respEmail: '',
        perguntaSeguranca: '', respostaSeguranca: '',

        documentos: {} as { [key: string]: string }
    });

    // atualiza texto dos inputs (filtro)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // upload (simulação)
    const handleUploadFake = (e: React.ChangeEvent<HTMLInputElement>, nomeDoc: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                documentos: { ...prev.documentos, [nomeDoc]: e.target.files![0].name }
            }));
        }
    };

    const avancarAba = () => {
        setAbaAtual(prev => prev + 1);
    };

    // mandar pro back
    const salvarDossie = async () => {
        const user = auth.currentUser;
        if (!user) return alert("Erro: Você precisa estar logado.");
        setCarregando(true);

        try {
            const respostaBack = await fetch('http://localhost:3000/api/empresa/completar-perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, dadosPerfil: formData })
            });

            const dadosBack = await respostaBack.json();
            if (!respostaBack.ok || !dadosBack.valido) {
                alert(`⚠️ Erro: ${dadosBack.erro}`);
                setCarregando(false);
                return;
            }

            alert("✅ Dossiê enviado com sucesso!");
            irParaPerfil();
        } catch (error) {
            alert("Erro de conexão com o servidor.");
            setCarregando(false);
        }
    };

    return (
        <div style={styles.telaInteira}>
            <div style={styles.caixaGigante}>

                <div style={styles.cabecalho}>
                    <div>
                        <h2 style={{ margin: 0, color: '#111' }}>Verificação da Operação</h2>
                        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Complete seu dossiê de transporte.</p>
                    </div>
                    <button onClick={irParaPerfil} style={styles.btnCancelar}>Cancelar</button>
                </div>

                <div style={styles.containerAbas}>
                    <button onClick={() => setAbaAtual(1)} style={abaAtual === 1 ? styles.abaAtiva : styles.abaInativa}>1. Identificação</button>
                    <button onClick={() => setAbaAtual(2)} style={abaAtual === 2 ? styles.abaAtiva : styles.abaInativa}>2. Operacional</button>
                    <button onClick={() => setAbaAtual(3)} style={abaAtual === 3 ? styles.abaAtiva : styles.abaInativa}>3. Contatos</button>
                    <button onClick={() => setAbaAtual(4)} style={abaAtual === 4 ? styles.abaAtiva : styles.abaInativa}>4. Responsável</button>
                    <button onClick={() => setAbaAtual(5)} style={abaAtual === 5 ? styles.abaAtiva : styles.abaInativa}>5. Documentos</button>
                </div>

                <div style={styles.areaFormulario}>
                    {/* componentes */}
                    {abaAtual === 1 && <AbaIdentificacao formData={formData} handleChange={handleChange} />}
                    {abaAtual === 2 && <AbaOperacional formData={formData} handleChange={handleChange} />}
                    {abaAtual === 3 && <AbaContato formData={formData} handleChange={handleChange} />}
                    {abaAtual === 4 && <AbaResponsavel formData={formData} handleChange={handleChange} />}
                    {abaAtual === 5 && <AbaDocumentos formData={formData} handleUploadFake={handleUploadFake} />}
                </div>

                <div style={styles.rodape}>
                    {abaAtual > 1 && <button onClick={() => setAbaAtual(prev => prev - 1)} style={styles.btnVoltar}>Anterior</button>}
                    {abaAtual < 5 ? (
                        <button onClick={avancarAba} style={styles.btnAvancar}>Próximo Passo</button>
                    ) : (
                        <button onClick={salvarDossie} disabled={carregando} style={styles.btnSalvarTudo}>
                            {carregando ? '⏳ Carregando Dossiê...' : '✅ Enviar Dossiê'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif', padding: '20px' },
    caixaGigante: { width: '900px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    cabecalho: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', borderBottom: '1px solid #eee' },
    btnCancelar: { padding: '8px 15px', backgroundColor: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    containerAbas: { display: 'flex', backgroundColor: '#fafafa', borderBottom: '1px solid #ddd', overflowX: 'auto' },
    abaAtiva: { flex: 1, padding: '15px 10px', backgroundColor: '#fff', color: '#4caf50', border: 'none', borderBottom: '3px solid #4caf50', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
    abaInativa: { flex: 1, padding: '15px 10px', backgroundColor: 'transparent', color: '#777', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' },
    areaFormulario: { padding: '40px 30px', minHeight: '450px', maxHeight: '60vh', overflowY: 'auto' },
    rodape: { display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '20px 30px', borderTop: '1px solid #eee', backgroundColor: '#fafafa' },
    btnVoltar: { padding: '12px 25px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnAvancar: { padding: '12px 25px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnSalvarTudo: { padding: '12px 25px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};