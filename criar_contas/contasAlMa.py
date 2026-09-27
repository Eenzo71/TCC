import os
import geradorEmailAlunoMais
import geradorNome
import geradorCpf
import geradorDataNascimento
import geradorCelular
import geradorCep
import geradorEscola
import geradorMatricula

def compilar_conta_aluno_maior():
    email_dados = geradorEmailAlunoMais.gerar()
    endereco_dados = geradorCep.gerar_cep_e_numero()
    escola_dados = geradorEscola.gerar_escola_e_turma()
    
    conta = {
        "E-mail": email_dados["email"],
        "Senha": email_dados["senha"],
        "Nome Completo": geradorNome.gerar_nome_completo(),
        "CPF": geradorCpf.gerar_cpf_valido(),
        "Nascimento": geradorDataNascimento.gerar_data_nascimento(18, 50),
        "Celular Principal": geradorCelular.gerar_celular_valido(),
        "Telefone Emergência": geradorCelular.gerar_celular_valido(),
        "CEP": endereco_dados.get("cep", ""),
        "Número": endereco_dados.get("numero", ""),
        "Escola": escola_dados.get("escola", ""),
        "Turma": escola_dados.get("turma", ""),
        "Matrícula": geradorMatricula.gerar_matricula()
    }
    
    texto_saida = (
        f"--- CONTA ALUNO (+18) ---\n"
        f"E-mail: {conta['E-mail']}\n"
        f"Senha: {conta['Senha']}\n"
        f"Nome: {conta['Nome Completo']}\n"
        f"CPF: {conta['CPF']} | Nascimento: {conta['Nascimento']}\n"
        f"Celular: {conta['Celular Principal']} | Emergência: {conta['Telefone Emergência']}\n"
        f"Endereço: CEP {conta['CEP']}, Número {conta['Número']}\n"
        f"Escolaridade: {conta['Escola']} - Turma: {conta['Turma']} (Matrícula: {conta['Matrícula']})\n"
        f"-------------------------\n\n"
    )
    
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'contasAlunosMaiores.txt')
    
    with open(caminho, 'a', encoding='utf-8') as f:
        f.write(texto_saida)
        
    print(f"Conta de Aluno Maior salva em {caminho}")

if __name__ == "__main__":
    compilar_conta_aluno_maior()