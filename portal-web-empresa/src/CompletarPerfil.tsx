import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

interface CompletarPerfilProps {
    irParaPerfil: () => void;
}

export default function CompletarPerfil({ irParaPerfil }: CompletarPerfilProps) {
    const [abaAtual, setAbaAtual] = useState(1);

    // estado pra suportar a lista
    const [formData, setFormData] = useState({
        // 1. Dados Básicos & 5. Atividade
        razaoSocial: '', nomeFantasia: '', cnpj: '', inscricaoEstadual: '', inscricaoMunicipal: '',
        dataAbertura: '', naturezaJuridica: '', porteEmpresa: 'MEI',
        cnaePrincipal: '', cnaeSecundario: '', descricaoAtividade: '', segmento: '',

        // 2. Endereço & 11. Operacional
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', pais: 'Brasil',
        numFuncionarios: '', horarioFuncionamento: '', filiais: '', areaAtuacao: '',

        // 3. Contato & 9. Presença Digital
        telFixoEmpresa: '', telWhatsEmpresa: '', telFixoGaragem: '', telWhatsGaragem: '',
        telFixoPersonalizado: '', telPersonalizado: '', emailPrincipal: '', emailFinanceiro: '', siteOficial: '',
        instagram: '', facebook: '', linkedin: '', googleMeuNegocio: '', outrosLinks: '',

        // 4. Responsável Legal & 8. Acesso
        respNome: '', respCpf: '', respRg: '', respDataNascimento: '', respCargo: '', respTelefone: '', respEmail: '',
        perguntaSeguranca: '', respostaSeguranca: '',

        documentos: {} as { [key: string]: string }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadFake = (e: React.ChangeEvent<HTMLInputElement>, nomeDoc: string) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                documentos: { ...prev.documentos, [nomeDoc]: e.target.files![0].name }
            }));
        }
    };

    const baixarTermoAutonomo = () => {
        alert("Iniciando download do 'Termo_de_Declaracao_Autonomo.pdf'...");
    };

    const avancarAba = () => {
        // Validação Aba 1
        if (abaAtual === 1) {
            if (!formData.naturezaJuridica || !formData.dataAbertura || !formData.cnaePrincipal || !formData.segmento || !formData.descricaoAtividade) {
                alert("⚠️ Preencha os campos obrigatórios da Aba 1 (Natureza, Data, CNAE, Segmento e Descrição).");
                return;
            }
        }
        // Validação Aba 2
        if (abaAtual === 2) {
            if (!formData.cep || !formData.logradouro || !formData.numero || !formData.bairro || !formData.cidade || !formData.estado || !formData.numFuncionarios || !formData.horarioFuncionamento || !formData.areaAtuacao) {
                alert("⚠️ Preencha os campos obrigatórios de endereço e operação na Aba 2.");
                return;
            }
        }
        // Validação Aba 3
        if (abaAtual === 3) {
            if (!formData.telWhatsEmpresa && !formData.telWhatsGaragem) {
                alert("⚠️ Forneça pelo menos um número de WhatsApp (Empresa ou Garagem).");
                return;
            }
            if (!formData.emailPrincipal) {
                alert("⚠️ O E-mail Principal é obrigatório.");
                return;
            }
        }
        // Validação Aba 4
        if (abaAtual === 4) {
            if (!formData.respNome || !formData.respCpf || !formData.respRg || !formData.respDataNascimento || !formData.respCargo || !formData.respTelefone || !formData.respEmail || !formData.perguntaSeguranca || !formData.respostaSeguranca) {
                alert("⚠️ Preencha todos os dados do Responsável Legal na Aba 4.");
                return;
            }
        }
        setAbaAtual(prev => prev + 1);
    };

    const BoxUpload = ({ label, sub, id }: { label: string, sub?: string, id: string }) => (
        <div style={styles.boxDocumento}>
            <h4 style={styles.tituloDoc}>{label}</h4>
            {sub && <p style={styles.subDoc}>{sub}</p>}
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleUploadFake(e, id)} style={{ fontSize: '12px' }} />
            {formData.documentos[id] && <span style={{ color: '#4caf50', fontSize: '12px', display: 'block', marginTop: '5px' }}>✅ {formData.documentos[id]}</span>}
        </div>
    );

    const salvarDossie = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Erro: Você precisa estar logado para salvar.");
            return;
        }

        const CHAVE_SECRETA = import.meta.env.VITE_alululu;

        const criptografar = (texto: string) => {
            if (!texto) return "";
            return CryptoJS.AES.encrypt(texto, CHAVE_SECRETA).toString();
        };

        if (formData.porteEmpresa === 'Autônomo' && !formData.documentos['docAutonomoAssinado']) {
            alert("⚠️ Você precisa enviar a foto da Declaração de Transporte assinada.");
            return;
        }
        if (formData.porteEmpresa !== 'Autônomo') {
            if (!formData.documentos['contratoSocial'] || !formData.documentos['alvara']) {
                alert("⚠️ Empresas com CNPJ precisam enviar pelo menos o Contrato Social e o Alvará.");
                return;
            }
        }
        if (!formData.documentos['cnhSocio'] || !formData.documentos['compEndEmpresa']) {
            alert("⚠️ Envie a CNH do Responsável e o Comprovante de Endereço.");
            return;
        }

        try {
            const docRef = doc(db, "empresas", user.uid);

            await updateDoc(docRef, {
                // 1. Dados Básicos e Fiscais
                porteEmpresa: formData.porteEmpresa,
                naturezaJuridica: formData.naturezaJuridica,
                dataAbertura: formData.dataAbertura,
                inscricaoEstadual: criptografar(formData.inscricaoEstadual),
                inscricaoMunicipal: criptografar(formData.inscricaoMunicipal),
                cnaePrincipal: formData.cnaePrincipal,
                cnaeSecundario: formData.cnaeSecundario,
                segmento: formData.segmento,
                descricaoAtividade: formData.descricaoAtividade,

                // 2. Endereço
                "endereco.cep": criptografar(formData.cep),
                "endereco.logradouro": criptografar(formData.logradouro),
                "endereco.numero": criptografar(formData.numero),
                "endereco.complemento": criptografar(formData.complemento),
                "endereco.bairro": criptografar(formData.bairro),
                "endereco.cidade": criptografar(formData.cidade),
                "endereco.estado": criptografar(formData.estado),
                "endereco.pais": criptografar(formData.pais),

                // 3. Contatos e Redes Sociais
                telFixoEmpresa: criptografar(formData.telFixoEmpresa),
                telWhatsEmpresa: criptografar(formData.telWhatsEmpresa),
                telFixoGaragem: criptografar(formData.telFixoGaragem),
                telWhatsGaragem: criptografar(formData.telWhatsGaragem),
                emailPrincipal: criptografar(formData.emailPrincipal),
                emailFinanceiro: criptografar(formData.emailFinanceiro),
                siteOficial: formData.siteOficial,
                instagram: formData.instagram,
                facebook: formData.facebook,
                linkedin: formData.linkedin,

                // 4. Operacional
                numFuncionarios: formData.numFuncionarios,
                horarioFuncionamento: formData.horarioFuncionamento,
                filiais: formData.filiais,
                areaAtuacao: formData.areaAtuacao,

                // 5. Responsável Legal
                "responsavelLegal.rg": criptografar(formData.respRg),
                "responsavelLegal.dataNascimento": criptografar(formData.respDataNascimento),
                "responsavelLegal.cargo": criptografar(formData.respCargo),
                "responsavelLegal.telefonePessoal": criptografar(formData.respTelefone),
                "responsavelLegal.emailPessoal": criptografar(formData.respEmail),
                perguntaSeguranca: criptografar(formData.perguntaSeguranca),
                respostaSeguranca: criptografar(formData.respostaSeguranca),

                documentosEnviados: formData.documentos,

                perfil_completo: true
            });

            alert("✅ Dossiê enviado com sucesso! Sua empresa agora está 100% verificada no BusGap.");
            irParaPerfil();

        } catch (error: any) {
            console.error("Erro ao salvar dossiê:", error);
            alert("Erro ao enviar dados: " + error.message);
        }
    };

    return (
        <div style={styles.telaInteira}>
            <div style={styles.caixaGigante}>

                {/* CABEÇALHO E ABAS */}
                <div style={styles.cabecalho}>
                    <div>
                        <h2 style={{ margin: 0, color: '#111' }}>Verificação da Empresa</h2>
                        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>Complete seu dossiê para operar na plataforma.</p>
                    </div>
                    <button onClick={irParaPerfil} style={styles.btnCancelar}>Cancelar</button>
                </div>

                <div style={styles.containerAbas}>
                    <button onClick={() => setAbaAtual(1)} style={abaAtual === 1 ? styles.abaAtiva : styles.abaInativa}>1. Empresa & Atividade</button>
                    <button onClick={() => abaAtual >= 2 && setAbaAtual(2)} style={abaAtual === 2 ? styles.abaAtiva : styles.abaInativa}>2. Endereço & Operação</button>
                    <button onClick={() => abaAtual >= 3 && setAbaAtual(3)} style={abaAtual === 3 ? styles.abaAtiva : styles.abaInativa}>3. Contatos & Redes</button>
                    <button onClick={() => abaAtual >= 4 && setAbaAtual(4)} style={abaAtual === 4 ? styles.abaAtiva : styles.abaInativa}>4. Responsável Legal</button>
                    <button onClick={() => abaAtual === 5 && setAbaAtual(5)} style={abaAtual === 5 ? styles.abaAtiva : styles.abaInativa}>5. Documentos</button>
                </div>

                <div style={styles.areaFormulario}>

                    {/* ABA 1*/}
                    {abaAtual === 1 && (
                        <div style={styles.grid2Colunas}>
                            <div style={styles.campo}><label style={styles.label}>Porte da Empresa:</label>
                                <select name="porteEmpresa" value={formData.porteEmpresa} onChange={handleChange} style={styles.input}>
                                    <option value="Autônomo">Autônomo (Sem CNPJ)</option>
                                    <option value="MEI">MEI</option>
                                    <option value="ME">Microempresa (ME)</option>
                                    <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
                                    <option value="LTDA">LTDA / S.A.</option>
                                </select>
                            </div>
                            <div style={styles.campo}><label style={styles.label}>Natureza Jurídica:</label><input name="naturezaJuridica" value={formData.naturezaJuridica} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Data de Abertura:</label><input type="date" name="dataAbertura" value={formData.dataAbertura} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Inscrição Estadual (Opcional):</label><input name="inscricaoEstadual" value={formData.inscricaoEstadual} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Inscrição Municipal (Opcional):</label><input name="inscricaoMunicipal" value={formData.inscricaoMunicipal} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>CNAE Principal:</label><input name="cnaePrincipal" value={formData.cnaePrincipal} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>CNAEs Secundários:</label><input name="cnaeSecundario" value={formData.cnaeSecundario} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Segmento:</label><input name="segmento" value={formData.segmento} onChange={handleChange} style={styles.input} /></div>
                            <div style={{ ...styles.campo, gridColumn: 'span 2' }}><label style={styles.label}>Descrição da Atividade:</label><textarea name="descricaoAtividade" rows={2} value={formData.descricaoAtividade} onChange={handleChange} style={styles.inputArea} /></div>
                        </div>
                    )}

                    {/* ABA 2*/}
                    {abaAtual === 2 && (
                        <div style={styles.grid2Colunas}>
                            <div style={styles.campo}><label style={styles.label}>CEP:</label><input name="cep" value={formData.cep} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>País:</label><input name="pais" value={formData.pais} onChange={handleChange} style={styles.input} /></div>
                            <div style={{ ...styles.campo, gridColumn: 'span 2' }}><label style={styles.label}>Logradouro (Rua/Av):</label><input name="logradouro" value={formData.logradouro} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Número:</label><input name="numero" value={formData.numero} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Complemento:</label><input name="complemento" value={formData.complemento} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Bairro:</label><input name="bairro" value={formData.bairro} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Cidade / UF:</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input name="cidade" value={formData.cidade} onChange={handleChange} style={{ ...styles.input, flex: 3 }} />
                                    <input name="estado" value={formData.estado} onChange={handleChange} style={{ ...styles.input, flex: 1 }} />
                                </div>
                            </div>
                            <div style={styles.divisor} />
                            <div style={styles.campo}><label style={styles.label}>Número de Funcionários:</label><input type="number" name="numFuncionarios" value={formData.numFuncionarios} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Horário de Funcionamento:</label><input name="horarioFuncionamento" value={formData.horarioFuncionamento} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Área de Atuação:</label><input name="areaAtuacao" placeholder="Cidades/Bairros" value={formData.areaAtuacao} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Filiais (Opcional):</label><input name="filiais" value={formData.filiais} onChange={handleChange} style={styles.input} /></div>
                        </div>
                    )}

                    {/* ABA 3*/}
                    {abaAtual === 3 && (
                        <div style={styles.grid2Colunas}>
                            <div style={styles.campo}><label style={styles.label}>Telefone Fixo (Empresa):</label><input name="telFixoEmpresa" value={formData.telFixoEmpresa} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>WhatsApp (Empresa):</label><input name="telWhatsEmpresa" value={formData.telWhatsEmpresa} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Telefone Fixo (Garagem):</label><input name="telFixoGaragem" value={formData.telFixoGaragem} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>WhatsApp (Garagem):</label><input name="telWhatsGaragem" value={formData.telWhatsGaragem} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>E-mail Principal:</label><input name="emailPrincipal" value={formData.emailPrincipal} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>E-mail Financeiro:</label><input name="emailFinanceiro" value={formData.emailFinanceiro} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.divisor} />
                            <div style={styles.campo}><label style={styles.label}>Instagram:</label><input name="instagram" value={formData.instagram} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Facebook:</label><input name="facebook" value={formData.facebook} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>LinkedIn:</label><input name="linkedin" value={formData.linkedin} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Site Oficial:</label><input name="siteOficial" value={formData.siteOficial} onChange={handleChange} style={styles.input} /></div>
                        </div>
                    )}

                    {/* ABA 4*/}
                    {abaAtual === 4 && (
                        <div style={styles.grid2Colunas}>
                            <div style={styles.campo}><label style={styles.label}>Nome Completo:</label><input name="respNome" value={formData.respNome} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Cargo (Ex: Sócio, Diretor):</label><input name="respCargo" value={formData.respCargo} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>CPF:</label><input name="respCpf" value={formData.respCpf} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>RG:</label><input name="respRg" value={formData.respRg} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Data de Nascimento:</label><input type="date" name="respDataNascimento" value={formData.respDataNascimento} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>Telefone Pessoal:</label><input name="respTelefone" value={formData.respTelefone} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.campo}><label style={styles.label}>E-mail Pessoal:</label><input name="respEmail" value={formData.respEmail} onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.divisor} />
                            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                                <label style={styles.label}>Pergunta de Segurança (Recuperação de Conta):</label>
                                <input name="perguntaSeguranca" placeholder="Ex: Qual o nome do seu primeiro animal de estimação?" value={formData.perguntaSeguranca} onChange={handleChange} style={{ ...styles.input, marginBottom: '10px' }} />
                                <input name="respostaSeguranca" placeholder="Resposta" value={formData.respostaSeguranca} onChange={handleChange} style={styles.input} />
                            </div>
                        </div>
                    )}

                    {/* ABA 5*/}
                    {abaAtual === 5 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Opção para Autônomos */}
                            {formData.porteEmpresa === 'Autônomo' && (
                                <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '10px', border: '1px solid #2196f3' }}>
                                    <h3 style={{ color: '#1565c0', margin: '0 0 10px 0' }}>📄 Declaração de Transporte (Sem CNPJ)</h3>
                                    <p style={{ fontSize: '14px', marginBottom: '15px' }}>Imprima, assine e envie a foto deste documento para validar sua frota autônoma.</p>
                                    <button type="button" onClick={baixarTermoAutonomo} style={styles.btnDownload}>⬇️ Baixar Termo de Responsabilidade</button>
                                    <div style={{ marginTop: '15px' }}>
                                        <input type="file" onChange={(e) => handleUploadFake(e, 'docAutonomoAssinado')} />
                                    </div>
                                </div>
                            )}

                            <h3 style={styles.tituloSecaoUpload}>12. Documentos da Empresa</h3>
                            <div style={styles.grid3Colunas}>
                                <BoxUpload id="cartaoCnpj" label="Cartão CNPJ" sub="Opcional se não tiver" />
                                <BoxUpload id="contratoSocial" label="Contrato Social / Requerimento" />
                                <BoxUpload id="alvara" label="Alvará de Funcionamento" />
                            </div>

                            <h3 style={styles.tituloSecaoUpload}>13. Certidões de Regularidade</h3>
                            <div style={styles.grid3Colunas}>
                                <BoxUpload id="cndFederal" label="CND Federal" />
                                <BoxUpload id="cndEstadual" label="CND Estadual" />
                                <BoxUpload id="crfFgts" label="Regularidade FGTS" />
                            </div>

                            <h3 style={styles.tituloSecaoUpload}>14 e 15. Responsável e Endereço</h3>
                            <div style={styles.grid3Colunas}>
                                <BoxUpload id="cnhSocio" label="CNH do Sócio/Motorista" sub="Substitui CPF/RG" />
                                <BoxUpload id="compEndEmpresa" label="Endereço (Empresa)" sub="Luz, Água ou Internet" />
                                <BoxUpload id="compEndResp" label="Endereço (Responsável)" />
                            </div>

                        </div>
                    )}

                </div>

                <div style={styles.rodape}>
                    {abaAtual > 1 && <button onClick={() => setAbaAtual(prev => prev - 1)} style={styles.btnVoltar}>Anterior</button>}
                    {abaAtual < 5 ? (
                        <button onClick={avancarAba} style={styles.btnAvancar}>Próximo Passo</button>
                    ) : (
                        <button onClick={salvarDossie} style={styles.btnSalvarTudo}>✅ Enviar Dossiê</button>
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
    grid2Colunas: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    grid3Colunas: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
    campo: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '12px', color: '#444', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    inputArea: { padding: '10px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none' },
    divisor: { gridColumn: 'span 2', height: '1px', backgroundColor: '#eee', margin: '10px 0' },
    tituloSecaoUpload: { fontSize: '16px', color: '#111', margin: '20px 0 10px 0', borderBottom: '2px solid #eee', paddingBottom: '5px' },
    boxDocumento: { padding: '15px', border: '1px dashed #bbb', borderRadius: '10px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    tituloDoc: { margin: '0 0 5px 0', fontSize: '14px', color: '#333' },
    subDoc: { margin: '0 0 10px 0', fontSize: '11px', color: '#777' },
    btnDownload: { padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    rodape: { display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '20px 30px', borderTop: '1px solid #eee', backgroundColor: '#fafafa' },
    btnVoltar: { padding: '12px 25px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnAvancar: { padding: '12px 25px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnSalvarTudo: { padding: '12px 25px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};