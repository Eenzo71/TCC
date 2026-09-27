import json
import random
import os

def gerar_escola_e_turma():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho_arquivo = os.path.join(diretorio, 'escolas.json')
    
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            lista_escolas = json.load(arquivo)
            
        if not lista_escolas:
            return "Erro: O arquivo 'escolas.json' está vazio."
            
        escola_sorteada = random.choice(lista_escolas)
        
        nome_escola = escola_sorteada.get("nome", "Escola Desconhecida")
        lista_turmas = escola_sorteada.get("turmas", [])
        
        if not lista_turmas:
            return f"Erro: A escola '{nome_escola}' não possui turmas cadastradas no JSON."
            
        turma_sorteada = random.choice(lista_turmas)
        
        return {"escola": nome_escola, "turma": turma_sorteada}
        
    except FileNotFoundError:
        return "Erro: O arquivo 'escolas.json' não foi encontrado no mesmo diretório."
    except json.JSONDecodeError:
        return "Erro: O arquivo 'escolas.json' não está formatado corretamente."

if __name__ == "__main__":
    resultado = gerar_escola_e_turma()
    
    if isinstance(resultado, dict):
        print(f"Escola selecionada: {resultado['escola']}")
        print(f"Turma selecionada: {resultado['turma']}")
    else:
        print(resultado)