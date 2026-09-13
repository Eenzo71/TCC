import React from 'react';
import './AbaStyles.css';

export default function AbaDocumentos({ formData, handleUploadFake }: any) {

    const BoxUpload = ({ label, sub, id }: { label: string, sub?: string, id: string }) => (
        <div className="boxDocumento">
            <h4 className="tituloDoc">{label}</h4>
            {sub && <p className="subDoc">{sub}</p>}
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleUploadFake(e, id)} style={{ fontSize: '12px', cursor: 'pointer' }} />
            {formData.documentos[id] && <span style={{ color: '#4caf50', fontSize: '12px', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✅ {formData.documentos[id]}</span>}
        </div>
    );

    const baixarTermoAutonomo = () => {
        alert("Iniciando download do 'Termo_de_Declaracao_Autonomo.pdf'...");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

            <div className="avisoCaixa">
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
                        <button type="button" onClick={baixarTermoAutonomo} className="btnDownload">⬇️ Baixar Termo (PDF)</button>
                        <div style={{ marginTop: '15px' }}>
                            <input type="file" onChange={(e) => handleUploadFake(e, 'docAutonomoAssinado')} />
                        </div>
                        {formData.documentos['docAutonomoAssinado'] && <span style={{ color: '#4caf50', fontSize: '12px', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✅ Anexado com sucesso</span>}
                    </div>

                    <h3 className="tituloSecaoUpload">Documentos do Motorista e Veículo</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="cnhMotorista" label="CNH (com EAR)" sub="Carteira de Motorista" />
                        <BoxUpload id="crlvVeiculo" label="Documento do Veículo" sub="CRLV atualizado" />
                        <BoxUpload id="compEndAutonomo" label="Comprovante de Endereço" sub="Água, Luz ou Internet" />
                    </div>
                </>
            )}

            {/* path mei */}
            {formData.porteEmpresa === 'MEI' && (
                <>
                    <h3 className="tituloSecaoUpload">Documentos do MEI</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="ccmei" label="Certificado MEI (CCMEI)" sub="Documento oficial do MEI" />
                        <BoxUpload id="cartaoCnpj" label="Cartão CNPJ" />
                        <BoxUpload id="compEndEmpresa" label="Endereço da Empresa" />
                    </div>
                    <h3 className="tituloSecaoUpload">Motorista e Veículo Principal</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="cnhSocio" label="CNH do Titular" />
                        <BoxUpload id="crlvVeiculo" label="Documento do Veículo" />
                    </div>
                </>
            )}

            {/* path ME, EPP, LTDA... */}
            {['ME', 'EPP', 'LTDA'].includes(formData.porteEmpresa) && (
                <>
                    <h3 className="tituloSecaoUpload">1. Documentação Jurídica</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="cartaoCnpj" label="Cartão CNPJ" />
                        <BoxUpload id="contratoSocial" label="Contrato Social" sub="Ou Requerimento de Empresário" />
                        <BoxUpload id="alvara" label="Alvará de Funcionamento" sub="Prefeitura" />
                    </div>

                    <h3 className="tituloSecaoUpload">2. Certidões (Compliance)</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="cndFederal" label="CND Federal" />
                        <BoxUpload id="cndEstadual" label="CND Estadual" />
                        <BoxUpload id="crfFgts" label="Regularidade FGTS" />
                    </div>
                    <h3 className="tituloSecaoUpload">3. Representante Legal</h3>
                    <div className="grid3Colunas">
                        <BoxUpload id="cnhSocio" label="CNH ou RG do Sócio" />
                        <BoxUpload id="compEndEmpresa" label="Comprovante - Empresa" />
                        <BoxUpload id="compEndResp" label="Comprovante - Sócio" />
                    </div>
                </>
            )}

        </div>
    );
}