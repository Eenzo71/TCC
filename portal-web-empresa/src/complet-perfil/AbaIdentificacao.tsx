import React from 'react';

export default function AbaIdentificacao({ formData, handleChange }: any) {
    return (
        <div style={styles.grid2Colunas}>
            <div style={{ ...styles.campo, gridColumn: 'span 2', marginBottom: '10px' }}>
                <label style={styles.labelDestaque}>Tipo de Operador (Como você trabalha?):</label>
                <select name="porteEmpresa" value={formData.porteEmpresa} onChange={handleChange} style={styles.inputSelect}>
                    <option value="Autônomo">Autônomo (Motorista Independente sem CNPJ)</option>
                    <option value="MEI">MEI (Pequeno Operador)</option>
                    <option value="ME">Microempresa (ME)</option>
                    <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
                    <option value="LTDA">Frota Estruturada (LTDA / S.A.)</option>
                </select>
            </div>

            <div style={styles.divisor} />

            {/* autonomo */}
            {formData.porteEmpresa === 'Autônomo' ? (
                <>
                    <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                        <label style={styles.label}>Nome Completo do Motorista:</label>
                        <input name="nomeAutonomo" placeholder="Seu nome" value={formData.nomeAutonomo} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>CPF:</label>
                        <input name="cpfAutonomo" placeholder="000.000.000-00" value={formData.cpfAutonomo} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.campo}>
                        <label style={styles.label}>Data de Nascimento:</label>
                        <input type="date" name="dataNascimentoAutonomo" value={formData.dataNascimentoAutonomo} onChange={handleChange} style={styles.input} />
                    </div>
                </>
            ) : (
                /* MEI, ME, LTDA... */
                <>
                    <div style={styles.campo}><label style={styles.label}>CNPJ:</label><input name="cnpj" placeholder="Somente números" value={formData.cnpj} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Data de Abertura:</label><input type="date" name="dataAbertura" value={formData.dataAbertura} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.campo}><label style={styles.label}>Razão Social:</label><input name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Nome Fantasia:</label><input name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.campo}><label style={styles.label}>Natureza Jurídica:</label><input name="naturezaJuridica" value={formData.naturezaJuridica} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>CNAE Principal:</label><input name="cnaePrincipal" value={formData.cnaePrincipal} onChange={handleChange} style={styles.input} /></div>

                    <div style={styles.divisor} />
                    <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Preencha os dados abaixo apenas se possuir ou julgar necessário.</p>
                    </div>
                    
                    <div style={styles.campo}><label style={styles.label}>Inscrição Estadual:</label><input name="inscricaoEstadual" placeholder="Opcional" value={formData.inscricaoEstadual} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Inscrição Municipal:</label><input name="inscricaoMunicipal" placeholder="Opcional" value={formData.inscricaoMunicipal} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.campo}><label style={styles.label}>CNAEs Secundários:</label><input name="cnaeSecundario" value={formData.cnaeSecundario} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Segmento Principal:</label><input name="segmento" placeholder="Ex: Transporte Escolar" value={formData.segmento} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                        <label style={styles.label}>Descrição da Atividade:</label>
                        <textarea name="descricaoAtividade" rows={2} value={formData.descricaoAtividade} onChange={handleChange} style={styles.inputArea} />
                    </div>
                </>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    grid2Colunas: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    campo: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '12px', color: '#444', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' },
    labelDestaque: { fontSize: '14px', color: '#111', fontWeight: 'bold', marginBottom: '8px' },
    input: { padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' },
    inputSelect: { padding: '12px', border: '2px solid #4caf50', borderRadius: '8px', fontSize: '15px', outline: 'none', fontWeight: 'bold', color: '#2e7d32', backgroundColor: '#e8f5e9', cursor: 'pointer' },
    inputArea: { padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none', backgroundColor: '#fafafa' },
    divisor: { gridColumn: 'span 2', height: '1px', backgroundColor: '#eee', margin: '5px 0' }
};