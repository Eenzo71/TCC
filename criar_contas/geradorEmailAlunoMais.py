import json
import os

def gerar():
    arquivo = 'emailAlunoMais.json'
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, arquivo)
    
    dados = []
    if os.path.exists(caminho):
        with open(caminho, 'r', encoding='utf-8') as f:
            try:
                dados = json.load(f)
            except json.JSONDecodeError:
                pass

    proximo_numero = len(dados) + 1
    novo = {"email": f"alunomaior{proximo_numero}@gmail.com", "senha": "12345678"}
    
    dados.append(novo)
    
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=4)
        
    return novo

if __name__ == "__main__":
    print(f"Gerado e salvo em emailAlunoMais.json: {gerar()}")