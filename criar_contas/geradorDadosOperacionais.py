import random

def gerar_dados_operacionais():
    tipos_transporte = ["Van Escolar", "Ônibus", "Micro-ônibus", "Carro Particular / App", "Frota Mista"]
    opcoes_monitor = ["Não", "Sim"]
    
    turnos = ["Manhã", "Tarde", "Noite", "Manhã e Tarde", "Integral"]
    areas = ["Centro", "Zona Sul", "Zona Norte", "Centro, Zona Sul", "Região Metropolitana", "Bairros periféricos"]
    horarios = ["06h às 18h", "05h30 às 19h", "07h às 17h", "06h às 12h", "12h às 18h"]

    tipo_selecionado = random.choice(tipos_transporte)
    
    if tipo_selecionado == "Carro Particular / App":
        capacidade = random.randint(4, 6)
    elif tipo_selecionado == "Van Escolar":
        capacidade = random.randint(12, 20)
    elif tipo_selecionado == "Micro-ônibus":
        capacidade = random.randint(22, 32)
    elif tipo_selecionado == "Ônibus":
        capacidade = random.randint(40, 60)
    else:
        capacidade = random.randint(15, 120)

    dados = {
        "tipo_transporte": tipo_selecionado,
        "possui_monitor": random.choice(opcoes_monitor),
        "capacidade_total": str(capacidade),
        "turnos_atendidos": random.choice(turnos),
        "area_atuacao": random.choice(areas),
        "horario_funcionamento": random.choice(horarios)
    }

    return dados

if __name__ == "__main__":
    resultado = gerar_dados_operacionais()
    print(f"TIPO DE TRANSPORTE: {resultado['tipo_transporte']}")
    print(f"POSSUI MONITOR(A)?: {resultado['possui_monitor']}")
    print(f"CAPACIDADE TOTAL (ALUNOS): {resultado['capacidade_total']}")
    print(f"TURNOS ATENDIDOS: {resultado['turnos_atendidos']}")
    print(f"ÁREA DE ATUAÇÃO (BAIRROS/REGIÃO): {resultado['area_atuacao']}")
    print(f"HORÁRIO DE FUNCIONAMENTO: {resultado['horario_funcionamento']}")