import random

def gerar_celular_valido():
    ddds_validos = [ddd for ddd in range(11, 100) if ddd % 10 != 0]
    ddd = random.choice(ddds_validos)
    
    primeira_parte = str(random.randint(0, 9999)).zfill(4)
    segunda_parte = str(random.randint(0, 9999)).zfill(4)
    
    celular_formatado = f"({ddd}) 9{primeira_parte}-{segunda_parte}"
    
    return celular_formatado

if __name__ == "__main__":
    celular = gerar_celular_valido()
    print(f"Celular gerado: {celular}")