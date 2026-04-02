import React from 'react';

export default function AbaDocumentos({ formData, handleUploadFake }: any) {
    
    const BoxUpload = ({ label, sub, id }: { label: string, sub?: string, id: string }) => (
        <div style={styles.boxDocumento}>
            <h4 style={styles.tituloDoc}>{label}</h4>
            {sub && <p style={styles.subDoc}>{sub}</p>}
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleUploadFake(e, id)} style={{ fontSize: '12px', cursor: 'pointer' }} />
            {formData.documentos[id] && <span style={{ color: '#4caf50', fontSize: '12px', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✅ {formData.documentos[id]}</span>}
        </div>
    );

    const baixarTermoAutonomo = () => {
        alert("Iniciando download do 'Termo_de_Declaracao_Autonomo.pdf'...");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div style={styles.avisoCaixa}>
                <span style={{ fontSize: '18px' }}>📸</span>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                    <strong>Dica:</strong> Você pode tirar uma foto clara dos documentos com o celular ou enviar em PDF. 
                    Seu perfil é {formData.porteEmpresa}, então listamos apenas o necessário para você.
                </p>
            </div>

            {/* path autonomo */}
            {formData.porteEmpresa === 'Autônomo' && (
                <>
                    <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '10px', border: '1px solid #2196f3' }}>
                        <h3 style={{ color: '#1565c0', margin: '0 0 10px 0' }}>📄 Termo de Responsabilidade (Obrigatório)</h3>
                        <p style={{ fontSize: '14px', marginBottom: '15px' }}>Imprima, assine e envie a foto deste documento para validar sua frota autônoma.</p>
                        <button type="button" onClick={baixarTermoAutonomo} style={styles.btnDownload}>⬇️ Baixar Termo (PDF)</button>
                        <div style={{ marginTop: '15px' }}>
                            <input type="file" onChange={(e) => handleUploadFake(e, 'docAutonomoAssinado')} />
                        </div>
                        {formData.documentos['docAutonomoAssinado'] && <span style={{ color: '#4caf50', fontSize: '12px', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✅ Anexado com sucesso</span>}
                    </div>

                    <h3 style={styles.tituloSecaoUpload}>Documentos do Motorista e Veículo</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="cnhMotorista" label="CNH (com EAR)" sub="Carteira de Motorista" />
                        <BoxUpload id="crlvVeiculo" label="Documento do Veículo" sub="CRLV atualizado" />
                        <BoxUpload id="compEndAutonomo" label="Comprovante de Endereço" sub="Água, Luz ou Internet" />
                    </div>
                </>
            )}

            {/* path mei */}
            {formData.porteEmpresa === 'MEI' && (
                <>
                    <h3 style={styles.tituloSecaoUpload}>Documentos do MEI</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="ccmei" label="Certificado MEI (CCMEI)" sub="Documento oficial do MEI" />
                        <BoxUpload id="cartaoCnpj" label="Cartão CNPJ" />
                        <BoxUpload id="compEndEmpresa" label="Endereço da Empresa" />
                    </div>
                    <h3 style={styles.tituloSecaoUpload}>Motorista e Veículo Principal</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="cnhSocio" label="CNH do Titular" />
                        <BoxUpload id="crlvVeiculo" label="Documento do Veículo" />
                    </div>
                </>
            )}

            {/* path ME, EPP, LTDA... */}
            {['ME', 'EPP', 'LTDA'].includes(formData.porteEmpresa) && (
                <>
                    <h3 style={styles.tituloSecaoUpload}>1. Documentação Jurídica</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="cartaoCnpj" label="Cartão CNPJ" />
                        <BoxUpload id="contratoSocial" label="Contrato Social" sub="Ou Requerimento de Empresário" />
                        <BoxUpload id="alvara" label="Alvará de Funcionamento" sub="Prefeitura" />
                    </div>

                    <h3 style={styles.tituloSecaoUpload}>2. Certidões (Compliance)</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="cndFederal" label="CND Federal" />
                        <BoxUpload id="cndEstadual" label="CND Estadual" />
                        <BoxUpload id="crfFgts" label="Regularidade FGTS" />
                    </div>

                    <h3 style={styles.tituloSecaoUpload}>3. Representante Legal</h3>
                    <div style={styles.grid3Colunas}>
                        <BoxUpload id="cnhSocio" label="CNH ou RG do Sócio" />
                        <BoxUpload id="compEndEmpresa" label="Comprovante - Empresa" />
                        <BoxUpload id="compEndResp" label="Comprovante - Sócio" />
                    </div>
                </>
            )}

        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    grid3Colunas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' },
    tituloSecaoUpload: { fontSize: '16px', color: '#111', margin: '15px 0 5px 0', borderBottom: '2px solid #eee', paddingBottom: '5px' },
    boxDocumento: { padding: '15px', border: '1px dashed #bbb', borderRadius: '10px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    tituloDoc: { margin: '0 0 5px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' },
    subDoc: { margin: '0 0 10px 0', fontSize: '11px', color: '#777' },
    btnDownload: { padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(33, 150, 243, 0.3)' },
    avisoCaixa: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #ff9800' }
};