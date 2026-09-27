import json
import random
import os

def gerar_nome_completo():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho_arquivo = os.path.join(diretorio, 'nomes.json')
    
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
    except FileNotFoundError:
        return "Erro: O arquivo 'nomes.json' não foi encontrado."
    except json.JSONDecodeError:
        return "Erro: O arquivo 'nomes.json' está formatado incorretamente."

    lista_nomes = [item["nomes"]["value"] for item in dados if "nomes" in item]
    lista_nomes2 = [item["nomes2"]["value"] for item in dados if "nomes2" in item]
    lista_sobrenomes = [item["sobrenomes"]["value"] for item in dados if "sobrenomes" in item]
    lista_sobrenomes2 = [item["sobrenomes2"]["value"] for item in dados if "sobrenomes2" in item]

    if not (lista_nomes and lista_sobrenomes and lista_sobrenomes2):
        return "Erro: Faltam dados essenciais no JSON (nomes, sobrenomes ou sobrenomes2)."

    nome1 = random.choice(lista_nomes)
    sobrenome1 = random.choice(lista_sobrenomes)
    sobrenome2 = random.choice(lista_sobrenomes2)

    incluir_nome2 = random.choice([True, False])
    
    if incluir_nome2 and lista_nomes2:
        nome2 = random.choice(lista_nomes2)
        nome_final = f"{nome1} {nome2} {sobrenome1} {sobrenome2}"
    else:
        nome_final = f"{nome1} {sobrenome1} {sobrenome2}"

    return nome_final

if __name__ == "__main__":
    nome_gerado = gerar_nome_completo()
    print(f"Nome gerado: {nome_gerado}")