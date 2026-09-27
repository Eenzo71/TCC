import os
import geradorEmailRes
import geradorNome
import geradorCpf
import geradorCelular
import geradorCep

def compilar_conta_responsavel():
    email_dados = geradorEmailRes.gerar()
    endereco_dados = geradorCep.gerar_cep_e_numero()
    
    conta = {
        "E-mail": email_dados["email"],
        "Senha": email_dados["senha"],
        "Nome Completo": geradorNome.gerar_nome_completo(),
        "CPF": geradorCpf.gerar_cpf_valido(),
        "Celular Principal": geradorCelular.gerar_celular_valido(),
        "Telefone Emergência": geradorCelular.gerar_celular_valido(),
        "CEP": endereco_dados.get("cep", ""),
        "Número": endereco_dados.get("numero", "")
    }
    
    texto_saida = (
        f"--- CONTA RESPONSÁVEL ---\n"
        f"E-mail: {conta['E-mail']}\n"
        f"Senha: {conta['Senha']}\n"
        f"Nome: {conta['Nome Completo']}\n"
        f"CPF: {conta['CPF']}\n"
        f"Celular: {conta['Celular Principal']}\n"
        f"Emergência: {conta['Telefone Emergência']}\n"
        f"Endereço: CEP {conta['CEP']}, Número {conta['Número']} (Restante preenchido via ViaCEP/Mapa)\n"
        f"-------------------------\n\n"
    )
    
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'contasResponsaveis.txt')
    
    with open(caminho, 'a', encoding='utf-8') as f:
        f.write(texto_saida)
        
    print(f"Conta de Responsável salva em {caminho}")

if __name__ == "__main__":
    compilar_conta_responsavel()