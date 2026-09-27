# contasAlMe.py
import os
import geradorEmailAlunoMenor
import geradorNome
import geradorDataNascimento
import geradorEscola
import geradorMatricula

def compilar_conta_aluno_menor():
    email_dados = geradorEmailAlunoMenor.gerar()
    escola_dados = geradorEscola.gerar_escola_e_turma()
    
    conta = {
        "Nome Completo": geradorNome.gerar_nome_completo(),
        "Nascimento": geradorDataNascimento.gerar_data_nascimento(3, 17),
        "E-mail App": email_dados["email"],
        "Senha App": email_dados["senha"],
        "Escola": escola_dados.get("escola", ""),
        "Turma": escola_dados.get("turma", ""),
        "Matrícula": geradorMatricula.gerar_matricula()
    }
    
    texto_saida = (
        f"--- CONTA DEPENDENTE (ALUNO MENOR) ---\n"
        f"Nome: {conta['Nome Completo']}\n"
        f"Nascimento: {conta['Nascimento']}\n"
        f"E-mail (App): {conta['E-mail App']}\n"
        f"Senha (App): {conta['Senha App']}\n"
        f"Escolaridade: {conta['Escola']} - Turma: {conta['Turma']} (Matrícula: {conta['Matrícula']})\n"
        f"--------------------------------------\n\n"
    )
    
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'contasAlunosMenores.txt')
    
    with open(caminho, 'a', encoding='utf-8') as f:
        f.write(texto_saida)
        
    print(f"Conta de Aluno Menor (Dependente) salva em {caminho}")

if __name__ == "__main__":
    compilar_conta_aluno_menor()