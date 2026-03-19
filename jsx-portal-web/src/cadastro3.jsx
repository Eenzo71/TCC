// css
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
    backgroundColor: '#e0e0e0',
  },
  progress100: {
    width: '100%',
    height: '100%',
    backgroundColor: '#41b8d5',
    borderRadius: '10px',
  },
  titulo: {
    fontSize: '18px',
    fontWeight: 'normal',
    marginBottom: '25px',
  },
  campo: {
    width: '100%',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#e6e6e6',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  linha: {
    width: '100%',
    display: 'flex',
    gap: '10px',
  },
  rua: {
    flex: 3,
  },
  numero: {
    flex: 1,
  },
  optional: {
    fontSize: '10px',
    color: '#666',
    marginTop: '-10px',
    marginBottom: '10px',
    alignSelf: 'flex-start',
  },
  mapa: {
    width: '100%',
    height: '150px',
    backgroundColor: '#bbb',
    borderRadius: '12px',
    marginTop: '10px',
  },
  mapaTexto: {
    fontSize: '11px',
    color: '#555',
    margin: '5px 0 20px 0',
  },
  botoes: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    justifyContent: 'center',
  },
  btn: {
    padding: '10px 25px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

const FormularioEndereco = () => {
  return (
    <div style={styles.container}>
      <div style={styles.boxLog}>
        
        <div style={styles.porcentagem}>
          <div style={styles.progress100}></div>
        </div>

        <h1 style={styles.titulo}>Crie a sua conta</h1>

        <div style={styles.campo}>
          <label htmlFor="cep" style={styles.label}>CEP:</label>
          <input type="text" placeholder="67676-767" id="cep" style={styles.input} />
        </div>

        <div style={styles.campo}>
          <label htmlFor="bairro" style={styles.label}>Bairro:</label>
          <input type="text" placeholder="Coloque o nome do seu bairro:" id="bairro" style={styles.input} />
        </div>

        <div style={styles.linha}>
          <div style={{ ...styles.campo, ...styles.rua }}>
            <label htmlFor="rua" style={styles.label}>Rua:</label>
            <input type="text" placeholder="Coloque o nome da sua rua:" id="rua" style={styles.input} />
          </div>

          <div style={{ ...styles.campo, ...styles.numero }}>
            <label htmlFor="numero" style={styles.label}>N°:</label>
            <input type="text" placeholder="157" id="numero" style={styles.input} />
          </div>
        </div>

        <div style={styles.campo}>
          <label htmlFor="complemento" style={styles.label}>Complemento:</label>
          <input type="text" placeholder='Ex: "Apto 102", "Fundos"...' id="complemento" style={styles.input} />
          <span style={styles.optional}>-optional</span>
        </div>

        <div style={styles.mapa}></div>
        <p style={styles.mapaTexto}>*Arraste para ajustar a localização exata</p>

        <div style={styles.botoes}>
          <button type="button" style={{ ...styles.btn, backgroundColor: '#bbb' }}>Voltar</button>
          <button type="submit" style={{ ...styles.btn, backgroundColor: '#41b8d5', color: 'white' }}>Finalizar Cadastro</button>
        </div>

      </div>
    </div>
  );
};

