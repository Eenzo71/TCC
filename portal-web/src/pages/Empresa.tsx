import React, { useState } from 'react';

// 1. Interface para a estrutura da Empresa
export interface EmpresaItem {
  id: string;
  nome: string;
  cnpj: string;
}

// 2. Dados de exemplo (2 empresas)
const empresasExemplo: EmpresaItem[] = [
  { id: '1', nome: 'Viação Estrela', cnpj: '12.345.678/0001-90' },
  { id: '2', nome: 'Expresso Horizonte', cnpj: '98.765.432/0001-10' },
];

interface SelecionarEmpresaProps {
  onSelecionar?: (empresa: EmpresaItem) => void;
}

export default function SelecionarEmpresa({ onSelecionar }: SelecionarEmpresaProps) {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);

  const handleSelect = (empresa: EmpresaItem) => {
    setEmpresaSelecionada(empresa.id);
    if (onSelecionar) {
      onSelecionar(empresa);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#1a237e', marginBottom: '20px' }}>
        Selecione uma Empresa
      </h2>

      <div style={gridStyle}>
        {empresasExemplo.map((empresa) => {
          const isSelected = empresaSelecionada === empresa.id;

          return (
            <div
              key={empresa.id}
              onClick={() => handleSelect(empresa)}
              style={{
                ...cardStyle,
                borderColor: isSelected ? '#1a237e' : '#ccc',
                backgroundColor: isSelected ? '#e8effd' : '#fff',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                {empresa.nome}
              </h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                CNPJ: {empresa.cnpj}
              </p>
              {isSelected && (
                <span style={badgeStyle}>✓ Selecionada</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- ESTILOS SIMPLES (INLINE) ---
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  fontFamily: 'sans-serif',
};

const gridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const cardStyle: React.CSSProperties = {
  border: '2px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  width: '220px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#1a237e',
};