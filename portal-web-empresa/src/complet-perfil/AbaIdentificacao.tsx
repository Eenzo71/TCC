import React from 'react';
import './AbaStyles.css';

export default function AbaIdentificacao({ formData, handleChange }: any) {
    return (
        <div className="grid-2-colunas">
            
            <div className="campo span-2" style={{ marginBottom: '10px' }}>
                <label className="label-destaque">Tipo de Operador (Como você trabalha?):</label>
                <select name="porteEmpresa" value={formData.porteEmpresa} onChange={handleChange} className="input-select-destaque">
                    <option value="Autônomo">Autônomo (Motorista Independente sem CNPJ)</option>
                    <option value="MEI">MEI (Pequeno Operador)</option>
                    <option value="ME">Microempresa (ME)</option>
                    <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
                    <option value="LTDA">Frota Estruturada (LTDA / S.A.)</option>
                </select>
            </div>

            <div className="divisor" />

            {/* autonomo */}
            {formData.porteEmpresa === 'Autônomo' ? (
                <>
                    <div className="campo span-2">
                        <label className="label">Nome Completo do Motorista:</label>
                        <input name="nomeAutonomo" placeholder="Seu nome" value={formData.nomeAutonomo} onChange={handleChange} className="aba-input" />
                    </div>
                    <div className="campo">
                        <label className="label">CPF:</label>
                        <input name="cpfAutonomo" placeholder="000.000.000-00" value={formData.cpfAutonomo} onChange={handleChange} className="aba-input" />
                    </div>
                    <div className="campo">
                        <label className="label">Data de Nascimento:</label>
                        <input type="date" name="dataNascimentoAutonomo" value={formData.dataNascimentoAutonomo} onChange={handleChange} className="aba-input" />
                    </div>
                </>
            ) : (
                /* MEI, ME, LTDA... */
                <>
                    <div className="campo"><label className="label">CNPJ:</label><input name="cnpj" placeholder="Somente números" value={formData.cnpj} onChange={handleChange} className="aba-input" /></div>
                    <div className="campo"><label className="label">Data de Abertura:</label><input type="date" name="dataAbertura" value={formData.dataAbertura} onChange={handleChange} className="aba-input" /></div>
                    
                    <div className="campo"><label className="label">Razão Social:</label><input name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} className="aba-input" /></div>
                    <div className="campo"><label className="label">Nome Fantasia:</label><input name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} className="aba-input" /></div>
                    
                    <div className="campo"><label className="label">Natureza Jurídica:</label><input name="naturezaJuridica" value={formData.naturezaJuridica} onChange={handleChange} className="aba-input" /></div>
                    <div className="campo"><label className="label">CNAE Principal:</label><input name="cnaePrincipal" value={formData.cnaePrincipal} onChange={handleChange} className="aba-input" /></div>

                    <div className="divisor" />
                    <div className="campo span-2">
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Preencha os dados abaixo apenas se possuir ou julgar necessário.</p>
                    </div>
                    
                    <div className="campo"><label className="label">Inscrição Estadual:</label><input name="inscricaoEstadual" placeholder="Opcional" value={formData.inscricaoEstadual} onChange={handleChange} className="aba-input" /></div>
                    <div className="campo"><label className="label">Inscrição Municipal:</label><input name="inscricaoMunicipal" placeholder="Opcional" value={formData.inscricaoMunicipal} onChange={handleChange} className="aba-input" /></div>
                    
                    <div className="campo"><label className="label">CNAEs Secundários:</label><input name="cnaeSecundario" value={formData.cnaeSecundario} onChange={handleChange} className="aba-input" /></div>
                    <div className="campo"><label className="label">Segmento Principal:</label><input name="segmento" placeholder="Ex: Transporte Escolar" value={formData.segmento} onChange={handleChange} className="aba-input" /></div>
                    
                    <div className="campo span-2">
                        <label className="label">Descrição da Atividade:</label>
                        <textarea name="descricaoAtividade" rows={2} value={formData.descricaoAtividade} onChange={handleChange} className="input-area" />
                    </div>
                </>
            )}
        </div>
    );
}