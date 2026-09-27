import json
import random
import os

def gerar_natureza_juridica():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'naturezaJuridica.json')
    
    try:
        with open(caminho, 'r', encoding='utf-8') as arquivo:
            lista_naturezas = json.load(arquivo)
            
        if not lista_naturezas:
            return "Erro: O arquivo 'naturezaJuridica.json' está vazio."
            
        natureza_sorteada = random.choice(lista_naturezas)
        return natureza_sorteada
        
    except FileNotFoundError:
        return "Erro: O arquivo 'naturezaJuridica.json' não foi encontrado."
    except json.JSONDecodeError:
        return "Erro: O arquivo 'naturezaJuridica.json' está formatado incorretamente."

if __name__ == "__main__":
    resultado = gerar_natureza_juridica()
    if isinstance(resultado, dict):
        print(f"Natureza Jurídica gerada: {resultado['natureza']}")
    else:
        print(resultado)