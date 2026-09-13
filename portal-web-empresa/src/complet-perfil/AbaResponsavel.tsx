import React from 'react';
import './AbaStyles.css';

export default function AbaResponsavel({ formData, handleChange }: any) {
    return (
        <div className="grid2Colunas">
            
            {/* se empresa pede sócio */}
            {formData.porteEmpresa !== 'Autônomo' ? (
                <>
                    <div className="campo span-2">
                        <h3 className="tituloSecao">👤 Dados do Sócio / Diretor</h3>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Quem responde legalmente pela empresa de transporte.</p>
                    </div>

                    <div className="campo"><label className="label">Nome Completo:</label><input name="respNome" value={formData.respNome} onChange={handleChange} className="input" /></div>
                    <div className="campo"><label className="label">Cargo (Ex: Sócio-Administrador):</label><input name="respCargo" value={formData.respCargo} onChange={handleChange} className="input" /></div>
                    
                    <div className="campo"><label className="label">CPF:</label><input name="respCpf" value={formData.respCpf} onChange={handleChange} className="input" /></div>
                    <div className="campo"><label className="label">RG:</label><input name="respRg" value={formData.respRg} onChange={handleChange} className="input" /></div>
                    
                    <div className="campo"><label className="label">Data de Nascimento:</label><input type="date" name="respDataNascimento" value={formData.respDataNascimento} onChange={handleChange} className="input" /></div>
                    <div className="campo"><label className="label">Telefone Pessoal (Oculto dos pais):</label><input name="respTelefone" value={formData.respTelefone} onChange={handleChange} className="input" /></div>
                    
                    <div className="campo span-2"><label className="label">E-mail Pessoal (Oculto dos pais):</label><input type="email" name="respEmail" value={formData.respEmail} onChange={handleChange} className="input" /></div>
                    
                    <div className="divisor" />
                </>
            ) : (
                /* se autonomo, ja temos */
                <div className="campo span-2" style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '10px', border: '1px solid #c8e6c9', marginBottom: '15px' }}>
                    <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                        ✅ <strong>Tudo certo!</strong> Como você opera como Autônomo, já registramos sua identidade. Defina apenas sua segurança abaixo.
                    </p>
                </div>
            )}

            {/* question security for all*/}
            <div className="campo span-2">
                <h3 className="tituloSecao">🔐 Recuperação de Conta e Segurança</h3>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>Usaremos isso caso você perca o acesso ou precise validar ações críticas no sistema.</p>
            </div>

            <div className="campo span-2">
                <label className="label">Pergunta de Segurança Secreta:</label>
                <input name="perguntaSeguranca" placeholder="Ex: Qual o nome do seu primeiro veículo?" value={formData.perguntaSeguranca} onChange={handleChange} className="input mb-15" />
                
                <label className="label">Resposta Exata:</label>
                <input name="respostaSeguranca" placeholder="Digite a resposta" value={formData.respostaSeguranca} onChange={handleChange} className="input" />
            </div>

        </div>
    );
}