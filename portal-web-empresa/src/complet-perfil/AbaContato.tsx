import React from 'react';
import './AbaStyles.css';

export default function AbaContato({ formData, handleChange }: any) {
    return (
        <div className="grid2Colunas">
            
            <div className="campo span-2">
                <h3 className="tituloSecao">📞 Contatos Oficiais</h3>
            </div>

            <div className="campo"><label className="label">E-mail Principal:</label><input type="email" name="emailPrincipal" placeholder="Para os pais e alunos" value={formData.emailPrincipal} onChange={handleChange} className="aba-input" /></div>
            <div className="campo"><label className="label">E-mail Financeiro (Opcional):</label><input type="email" name="emailFinanceiro" placeholder="Para cobranças" value={formData.emailFinanceiro} onChange={handleChange} className="aba-input" /></div>

            <div className="campo"><label className="label">WhatsApp Principal:</label><input name="telWhatsEmpresa" placeholder="(00) 00000-0000" value={formData.telWhatsEmpresa} onChange={handleChange} className="aba-input" /></div>
            <div className="campo"><label className="label">Telefone Fixo (Opcional):</label><input name="telFixoEmpresa" placeholder="(00) 0000-0000" value={formData.telFixoEmpresa} onChange={handleChange} className="aba-input" /></div>

            <div className="campo"><label className="label">WhatsApp da Garagem (Opcional):</label><input name="telWhatsGaragem" value={formData.telWhatsGaragem} onChange={handleChange} className="aba-input" /></div>
            <div className="campo"><label className="label">Fixo da Garagem (Opcional):</label><input name="telFixoGaragem" value={formData.telFixoGaragem} onChange={handleChange} className="aba-input" /></div>

            <div className="divisor" />

            <div className="campo span-2">
                <h3 className="tituloSecao">🌐 Presença Digital (Opcionais)</h3>
            </div>

            <div className="campo"><label className="label">Instagram:</label><input name="instagram" placeholder="@suaempresa" value={formData.instagram} onChange={handleChange} className="aba-input" /></div>
            <div className="campo"><label className="label">Facebook:</label><input name="facebook" placeholder="Link da página" value={formData.facebook} onChange={handleChange} className="aba-input" /></div>
            
            <div className="campo"><label className="label">Site Oficial:</label><input name="siteOficial" placeholder="www.suaempresa.com.br" value={formData.siteOficial} onChange={handleChange} className="aba-input" /></div>
            <div className="campo"><label className="label">LinkedIn:</label><input name="linkedin" placeholder="Link da empresa" value={formData.linkedin} onChange={handleChange} className="aba-input" /></div>

        </div>
    );
}