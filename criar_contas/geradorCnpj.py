import random

def calcular_digito_cnpj(cnpj_parcial, pesos):
    soma = sum(int(digito) * peso for digito, peso in zip(cnpj_parcial, pesos))
    resto = soma % 11
    return '0' if resto < 2 else str(11 - resto)

def gerar_cnpj_valido():
    while True:
        base = [str(random.randint(0, 9)) for _ in range(8)] + ['0', '0', '0', '1']
        if len(set(base)) > 1:
            break

    cnpj_parcial = ''.join(base)
    
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    digito1 = calcular_digito_cnpj(cnpj_parcial, pesos1)
    cnpj_parcial += digito1
    
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    digito2 = calcular_digito_cnpj(cnpj_parcial, pesos2)
    cnpj_final = cnpj_parcial + digito2
    
    return f"{cnpj_final[:2]}.{cnpj_final[2:5]}.{cnpj_final[5:8]}/{cnpj_final[8:12]}-{cnpj_final[12:]}"

if __name__ == "__main__":
    print(f"CNPJ gerado: {gerar_cnpj_valido()}")