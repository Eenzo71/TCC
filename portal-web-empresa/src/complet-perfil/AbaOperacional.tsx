import React from 'react';

export default function AbaOperacional({ formData, handleChange }: any) {
    return (
        <div style={styles.grid2Colunas}>
            
            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <h3 style={styles.tituloSecao}>📍 Endereço Base / Garagem</h3>
            </div>

            <div style={styles.campo}><label style={styles.label}>CEP:</label><input name="cep" value={formData.cep} onChange={handleChange} style={styles.input} placeholder="00000-000" /></div>
            <div style={styles.campo}><label style={styles.label}>País:</label><input name="pais" value={formData.pais} onChange={handleChange} style={styles.input} /></div>
            <div style={{ ...styles.campo, gridColumn: 'span 2' }}><label style={styles.label}>Logradouro (Rua/Av):</label><input name="logradouro" value={formData.logradouro} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>Número:</label><input name="numero" value={formData.numero} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Complemento:</label><input name="complemento" placeholder="Opcional" value={formData.complemento} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>Bairro:</label><input name="bairro" value={formData.bairro} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Cidade / UF:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input name="cidade" value={formData.cidade} onChange={handleChange} style={{ ...styles.input, flex: 3 }} placeholder="Cidade" />
                    <input name="estado" value={formData.estado} onChange={handleChange} style={{ ...styles.input, flex: 1 }} placeholder="UF" />
                </div>
            </div>

            <div style={styles.divisor} />

            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <h3 style={styles.tituloSecao}>🚐 Dados Operacionais</h3>
            </div>

            <div style={styles.campo}><label style={styles.label}>Tipo de Transporte:</label>
                <select name="tipoTransporte" value={formData.tipoTransporte} onChange={handleChange} style={styles.input}>
                    <option value="Van">Van Escolar</option>
                    <option value="Ônibus">Ônibus</option>
                    <option value="Micro-ônibus">Micro-ônibus</option>
                    <option value="Carro">Carro Particular / App</option>
                    <option value="Misto">Frota Mista</option>
                </select>
            </div>
            
            <div style={styles.campo}><label style={styles.label}>Possui Monitor(a)?</label>
                <select name="possuiMonitor" value={formData.possuiMonitor} onChange={handleChange} style={styles.input}>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                </select>
            </div>

            <div style={styles.campo}><label style={styles.label}>Capacidade Total (Alunos):</label><input type="number" name="capacidadeTotal" placeholder="Ex: 15" value={formData.capacidadeTotal} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Turnos Atendidos:</label><input name="turnos" placeholder="Ex: Manhã e Tarde" value={formData.turnos} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>Área de Atuação (Bairros/Região):</label><input name="areaAtuacao" placeholder="Ex: Centro, Zona Sul" value={formData.areaAtuacao} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Horário de Funcionamento:</label><input name="horarioFuncionamento" placeholder="Ex: 06h às 18h" value={formData.horarioFuncionamento} onChange={handleChange} style={styles.input} /></div>

            {/* funcionarios e filiais para empresa */}
            {!['Autônomo', 'MEI'].includes(formData.porteEmpresa) && (
                <>
                    <div style={styles.divisor} />
                    <div style={styles.campo}><label style={styles.label}>Número de Funcionários:</label><input type="number" name="numFuncionarios" value={formData.numFuncionarios} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Possui Filiais? (Opcional):</label><input name="filiais" placeholder="Onde?" value={formData.filiais} onChange={handleChange} style={styles.input} /></div>
                </>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    grid2Colunas: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    campo: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '12px', color: '#444', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' },
    input: { padding: '12px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' },
    tituloSecao: { fontSize: '16px', color: '#111', margin: '15px 0 0 0', borderBottom: '2px solid #eee', paddingBottom: '5px' },
    divisor: { gridColumn: 'span 2', height: '1px', backgroundColor: '#eee', margin: '5px 0' }
};