import React from 'react';

export default function AbaResponsavel({ formData, handleChange }: any) {
    return (
        <div style={styles.grid2Colunas}>
            
            {/* se empresa pede sócio */}
            {formData.porteEmpresa !== 'Autônomo' ? (
                <>
                    <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                        <h3 style={styles.tituloSecao}>👤 Dados do Sócio / Diretor</h3>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Quem responde legalmente pela empresa de transporte.</p>
                    </div>

                    <div style={styles.campo}><label style={styles.label}>Nome Completo:</label><input name="respNome" value={formData.respNome} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Cargo (Ex: Sócio-Administrador):</label><input name="respCargo" value={formData.respCargo} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.campo}><label style={styles.label}>CPF:</label><input name="respCpf" value={formData.respCpf} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>RG:</label><input name="respRg" value={formData.respRg} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.campo}><label style={styles.label}>Data de Nascimento:</label><input type="date" name="respDataNascimento" value={formData.respDataNascimento} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.campo}><label style={styles.label}>Telefone Pessoal (Oculto dos pais):</label><input name="respTelefone" value={formData.respTelefone} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={{ ...styles.campo, gridColumn: 'span 2' }}><label style={styles.label}>E-mail Pessoal (Oculto dos pais):</label><input type="email" name="respEmail" value={formData.respEmail} onChange={handleChange} style={styles.input} /></div>
                    
                    <div style={styles.divisor} />
                </>
            ) : (
                /* se autonomo, ja temos */
                <div style={{ ...styles.campo, gridColumn: 'span 2', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '10px', border: '1px solid #c8e6c9', marginBottom: '15px' }}>
                    <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                        ✅ <strong>Tudo certo!</strong> Como você opera como Autônomo, já registramos sua identidade. Defina apenas sua segurança abaixo.
                    </p>
                </div>
            )}

            {/* question security for all*/}
            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <h3 style={styles.tituloSecao}>🔐 Recuperação de Conta e Segurança</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Usaremos isso caso você perca o acesso ou precise validar ações críticas no sistema.</p>
            </div>

            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <label style={styles.label}>Pergunta de Segurança Secreta:</label>
                <input name="perguntaSeguranca" placeholder="Ex: Qual o nome do seu primeiro veículo?" value={formData.perguntaSeguranca} onChange={handleChange} style={{ ...styles.input, marginBottom: '15px' }} />
                
                <label style={styles.label}>Resposta Exata:</label>
                <input name="respostaSeguranca" placeholder="Digite a resposta" value={formData.respostaSeguranca} onChange={handleChange} style={styles.input} />
            </div>

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