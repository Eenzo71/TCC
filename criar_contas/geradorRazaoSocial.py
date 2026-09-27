import json
import random
import os

def gerar_razao_social():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'razaoSocial.json')
    
    try:
        with open(caminho, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
    except FileNotFoundError:
        return "Erro: O arquivo 'razaoSocial.json' não foi encontrado."

    lista_nome1 = [item["nome1"]["value"] for item in dados if "nome1" in item]
    lista_nome2 = [item["nome2"]["value"] for item in dados if "nome2" in item]
    lista_nome3 = [item["nome3"]["value"] for item in dados if "nome3" in item]

    nome1 = random.choice(lista_nome1)
    nome2 = random.choice(lista_nome2)
    nome3 = random.choice(lista_nome3)

    decisao = random.choice([1, 2, 3])
    
    if decisao == 1:
        resultado = nome1
    elif decisao == 2:
        resultado = f"{nome1} {nome3}"
    else:
        resultado = f"{nome1} {nome2} {nome3}"

    return resultado

if __name__ == "__main__":
    print(f"Razão Social gerada: {gerar_razao_social()}")