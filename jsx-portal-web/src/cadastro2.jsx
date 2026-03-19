
//css
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#dcdcdc',
  },
  boxLog: {
    width: '450px',
    backgroundColor: '#cfcfcf',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '25px',
    height: 'auto',
  },
  porcentagem: {
    width: '100%',
    height: '15px',
    borderRadius: '10px',
    marginBottom: '25px',
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  progress66: {
    width: '66%',
    height: '100%',
    backgroundColor: '#41b8d5',
    borderRadius: '10px',
    position: 'absolute',
    left: 0,
    zIndex: 2,
  },
  progress33: {
    width: '38%',
    height: '100%',
    backgroundColor: '#6ce5e8',
    borderRadius: '10px',
    position: 'absolute',
    left: '62%',
    zIndex: 1,
  },
  campo: {
    width: '100%',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  label: {
    width: '160px',
    fontSize: '13px',
    textAlign: 'right',
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#e6e6e6',
  },
  obrigatorio: {
    fontSize: '12px',
    color: '#666',
    alignSelf: 'flex-start',
    marginBottom: '20px',
  },
  botoes: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
  },
  btnVoltar: {
    padding: '10px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    backgroundColor: '#bbb',
  },
  btnProximo: {
    padding: '10px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    backgroundColor: '#41b8d5',
    color: 'white',
  }
};


const Cadastro = () => {
  return (
    <div style={styles.container}>
      <div style={styles.boxLog}>
        
        <div style={styles.porcentagem}>
          <div style={styles.progress66}></div>
          <div style={styles.progress33}></div>
        </div>

        <h1 style={{ marginBottom: '20px' }}>Crie a sua conta</h1>

        <div style={styles.campo}>
          <label htmlFor="nome" style={styles.label}>Nome Completo:</label>
          <input type="text" id="nome" placeholder="Seu nome" style={styles.input} />
        </div>

        <div style={styles.campo}>
          <label htmlFor="cpf" style={styles.label}>CPF:</label>
          <input type="text" id="cpf" placeholder="000.000.000-00" style={styles.input} />
        </div>

        <div style={styles.campo}>
          <label htmlFor="telefone-principal" style={styles.label}>Celular Principal:</label>
          <input type="text" id="telefone-principal" placeholder="+55 (00) 0 0000-0000" style={styles.input} />
        </div>

        <div style={styles.campo}>
          <label htmlFor="telefone-emergencia" style={styles.label}>Telefones de Emergência:</label>
          <input type="text" id="telefone-emergencia" placeholder="+55 (00) 0 0000-0000" style={styles.input} />
        </div>

        <span style={styles.obrigatorio}>*obrigatório</span>

        <div style={styles.botoes}>
          <button type="button" style={styles.btnVoltar}>Voltar</button>
          <button type="submit" style={styles.btnProximo}>Próximo</button>
        </div>

      </div>
    </div>
  );
};
