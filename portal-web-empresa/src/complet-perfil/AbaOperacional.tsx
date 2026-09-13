import React from 'react';
import './AbaStyles.css';

export default function AbaOperacional({ formData, handleChange }: any) {
    return (
        <div className="grid2Colunas">
            
            <div className="campo span-2">
                <h3 className="tituloSecao">📍 Endereço Base / Garagem</h3>
            </div>

            <div className="campo"><label className="label">CEP:</label><input name="cep" value={formData.cep} onChange={handleChange} className="input" placeholder="00000-000" /></div>
            <div className="campo"><label className="label">País:</label><input name="pais" value={formData.pais} onChange={handleChange} className="input" /></div>
            <div className="campo span-2"><label className="label">Logradouro (Rua/Av):</label><input name="logradouro" value={formData.logradouro} onChange={handleChange} className="input" /></div>
            
            <div className="campo"><label className="label">Número:</label><input name="numero" value={formData.numero} onChange={handleChange} className="input" /></div>
            <div className="campo"><label className="label">Complemento:</label><input name="complemento" placeholder="Opcional" value={formData.complemento} onChange={handleChange} className="input" /></div>
            
            <div className="campo"><label className="label">Bairro:</label><input name="bairro" value={formData.bairro} onChange={handleChange} className="input" /></div>
            <div className="campo"><label className="label">Cidade / UF:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input name="cidade" value={formData.cidade} onChange={handleChange} className="input flex-3" placeholder="Cidade" />
                    <input name="estado" value={formData.estado} onChange={handleChange} className="input flex-1" placeholder="UF" />
                </div>
            </div>

            <div className="divisor" />

            <div className="campo span-2">
                <h3 className="tituloSecao">🚐 Dados Operacionais</h3>
            </div>

            <div className="campo"><label className="label">Tipo de Transporte:</label>
                <select name="tipoTransporte" value={formData.tipoTransporte} onChange={handleChange} className="input">
                    <option value="Van">Van Escolar</option>
                    <option value="Ônibus">Ônibus</option>
                    <option value="Micro-ônibus">Micro-ônibus</option>
                    <option value="Carro">Carro Particular / App</option>
                    <option value="Misto">Frota Mista</option>
                </select>
            </div>
            
            <div className="campo"><label className="label">Possui Monitor(a)?</label>
                <select name="possuiMonitor" value={formData.possuiMonitor} onChange={handleChange} className="input">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                </select>
            </div>

            <div className="campo"><label className="label">Capacidade Total (Alunos):</label><input type="number" name="capacidadeTotal" placeholder="Ex: 15" value={formData.capacidadeTotal} onChange={handleChange} className="input" /></div>
            <div className="campo"><label className="label">Turnos Atendidos:</label><input name="turnos" placeholder="Ex: Manhã e Tarde" value={formData.turnos} onChange={handleChange} className="input" /></div>
            
            <div className="campo"><label className="label">Área de Atuação (Bairros/Região):</label><input name="areaAtuacao" placeholder="Ex: Centro, Zona Sul" value={formData.areaAtuacao} onChange={handleChange} className="input" /></div>
            <div className="campo"><label className="label">Horário de Funcionamento:</label><input name="horarioFuncionamento" placeholder="Ex: 06h às 18h" value={formData.horarioFuncionamento} onChange={handleChange} className="input" /></div>

            {/* funcionarios e filiais para empresa */}
            {!['Autônomo', 'MEI'].includes(formData.porteEmpresa) && (
                <>
                    <div className="divisor" />
                    <div className="campo"><label className="label">Número de Funcionários:</label><input type="number" name="numFuncionarios" value={formData.numFuncionarios} onChange={handleChange} className="input" /></div>
                    <div className="campo"><label className="label">Possui Filiais? (Opcional):</label><input name="filiais" placeholder="Onde?" value={formData.filiais} onChange={handleChange} className="input" /></div>
                </>
            )}
        </div>
    );
}