import React from 'react';

export default function AbaContato({ formData, handleChange }: any) {
    return (
        <div style={styles.grid2Colunas}>
            
            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <h3 style={styles.tituloSecao}>📞 Contatos Oficiais</h3>
            </div>

            <div style={styles.campo}><label style={styles.label}>E-mail Principal:</label><input type="email" name="emailPrincipal" placeholder="Para os pais e alunos" value={formData.emailPrincipal} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>E-mail Financeiro (Opcional):</label><input type="email" name="emailFinanceiro" placeholder="Para cobranças" value={formData.emailFinanceiro} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>WhatsApp Principal:</label><input name="telWhatsEmpresa" placeholder="(00) 00000-0000" value={formData.telWhatsEmpresa} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Telefone Fixo (Opcional):</label><input name="telFixoEmpresa" placeholder="(00) 0000-0000" value={formData.telFixoEmpresa} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>WhatsApp da Garagem (Opcional):</label><input name="telWhatsGaragem" value={formData.telWhatsGaragem} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Fixo da Garagem (Opcional):</label><input name="telFixoGaragem" value={formData.telFixoGaragem} onChange={handleChange} style={styles.input} /></div>

            <div style={styles.divisor} />

            <div style={{ ...styles.campo, gridColumn: 'span 2' }}>
                <h3 style={styles.tituloSecao}>🌐 Presença Digital (Opcionais)</h3>
            </div>

            <div style={styles.campo}><label style={styles.label}>Instagram:</label><input name="instagram" placeholder="@suaempresa" value={formData.instagram} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>Facebook:</label><input name="facebook" placeholder="Link da página" value={formData.facebook} onChange={handleChange} style={styles.input} /></div>
            
            <div style={styles.campo}><label style={styles.label}>Site Oficial:</label><input name="siteOficial" placeholder="www.suaempresa.com.br" value={formData.siteOficial} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.campo}><label style={styles.label}>LinkedIn:</label><input name="linkedin" placeholder="Link da empresa" value={formData.linkedin} onChange={handleChange} style={styles.input} /></div>

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