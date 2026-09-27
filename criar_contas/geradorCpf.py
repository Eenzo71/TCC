import random

def gerar_cpf_valido():
    while True:
        cpf_base = [random.randint(0, 9) for _ in range(9)]
        if len(set(cpf_base)) > 1:
            break

    soma = 0
    for i in range(9):
        soma += cpf_base[i] * (10 - i) 
    
    resto = (soma * 10) % 11
    if resto == 10 or resto == 11:
        resto = 0
    
    cpf_base.append(resto)

    soma = 0
    for i in range(10):
        soma += cpf_base[i] * (11 - i)
        
    resto = (soma * 10) % 11
    if resto == 10 or resto == 11:
        resto = 0
        
    cpf_base.append(resto)
    
    cpf_str = ''.join(map(str, cpf_base))
    cpf_formatado = f"{cpf_str[:3]}.{cpf_str[3:6]}.{cpf_str[6:9]}-{cpf_str[9:]}"
    
    return cpf_formatado

if __name__ == "__main__":
    cpf = gerar_cpf_valido()
    print(f"CPF gerado: {cpf}")