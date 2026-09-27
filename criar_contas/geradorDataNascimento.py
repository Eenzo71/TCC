import random
from datetime import date, timedelta

def gerar_data_nascimento_maior(idade_minima=18, idade_maxima=80):
    ano_atual = date.today().year
    ano_inicio = ano_atual - idade_maxima
    ano_fim = ano_atual - idade_minima
    data_inicial = date(ano_inicio, 1, 1)
    data_final = date(ano_fim, 12, 31)
    total_dias = (data_final - data_inicial).days
    dias_sorteados = random.randint(0, total_dias)
    data_sorteada = data_inicial + timedelta(days=dias_sorteados)
    
    return data_sorteada.strftime("%d/%m/%Y")

def gerar_data_nascimento_menor(idade_minima=3, idade_maxima=17):
    ano_atual = date.today().year
    ano_inicio = ano_atual - idade_maxima
    ano_fim = ano_atual - idade_minima
    data_inicial = date(ano_inicio, 1, 1)
    data_final = date(ano_fim, 12, 31)
    total_dias = (data_final - data_inicial).days
    dias_sorteados = random.randint(0, total_dias)
    data_sorteada = data_inicial + timedelta(days=dias_sorteados)
    
    return data_sorteada.strftime("%d/%m/%Y")

if __name__ == "__main__":
    data = gerar_data_nascimento_maior()
    data2 = gerar_data_nascimento_menor()
    print(f"Data de nascimento gerada: {data}")
    print(f"Data de nascimento gerada: {data2}")