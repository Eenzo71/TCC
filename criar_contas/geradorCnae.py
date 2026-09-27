import json
import random
import os

def gerar_cnae():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'cnae.json')
    
    try:
        with open(caminho, 'r', encoding='utf-8') as arquivo:
            lista_cnaes = json.load(arquivo)
            
        if not lista_cnaes:
            return "Erro: O arquivo 'cnae.json' está vazio."
            
        cnae_sorteado = random.choice(lista_cnaes)
        return cnae_sorteado
        
    except FileNotFoundError:
        return "Erro: O arquivo 'cnae.json' não foi encontrado."
    except json.JSONDecodeError:
        return "Erro: O arquivo 'cnae.json' está formatado incorretamente."

if __name__ == "__main__":
    resultado = gerar_cnae()
    if isinstance(resultado, dict):
        print(f"CNAE gerado: {resultado['codigo']} - {resultado['descricao']}")
    else:
        print(resultado)