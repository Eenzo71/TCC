import json
import random
import os

def gerar_cep_e_numero():
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    caminho_arquivo = os.path.join(diretorio_atual, 'CepsNum.json')
    
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            lista_ceps = json.load(arquivo)
            
        if not lista_ceps:
            return "Erro: A lista no arquivo JSON está vazia."
            
        item_sorteado = random.choice(lista_ceps)
        
        cep = item_sorteado.get("cep")
        numero = item_sorteado.get("numero")
        
        return {"cep": cep, "numero": numero}
        
    except FileNotFoundError:
        return "Erro: O arquivo 'CepsNum.json' não foi encontrado no mesmo diretório."
    except json.JSONDecodeError:
        return "Erro: O arquivo 'CepsNum.json' não está formatado corretamente."

if __name__ == "__main__":
    resultado = gerar_cep_e_numero()
    
    if isinstance(resultado, dict):
        print(f"CEP sorteado: {resultado['cep']}")
        print(f"Número sorteado: {resultado['numero']}")
    else:
        print(resultado)