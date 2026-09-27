import random
import string

def _digitos(tamanho):
    return ''.join(random.choices(string.digits, k=tamanho))


def gerar_cpf():
    """
    Gera um CPF sintético com dígitos verificadores válidos.
    """

    # Evita sequências óbvias como 11111111111
    numeros = [random.randint(0, 9) for _ in range(9)]

    # Primeiro dígito
    soma = sum(numeros[i] * (10 - i) for i in range(9))
    resto = (soma * 10) % 11
    digito1 = 0 if resto == 10 else resto

    numeros.append(digito1)

    # Segundo dígito
    soma = sum(numeros[i] * (11 - i) for i in range(10))
    resto = (soma * 10) % 11
    digito2 = 0 if resto == 10 else resto

    numeros.append(digito2)

    return ''.join(map(str, numeros))


def gerar_cnpj():
    """
    Gera um CNPJ sintético com dígitos verificadores válidos.
    """
    base = [random.randint(0, 9) for _ in range(8)]

    base += [0, 0, 0, 1]

    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    soma = sum(n * p for n, p in zip(base, pesos1))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    base.append(digito1)

    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    soma = sum(n * p for n, p in zip(base, pesos2))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    base.append(digito2)

    return ''.join(map(str, base))



def gerar_celular(formatado=False):
    """
    Gera um celular brasileiro sintético com 11 dígitos.
    """

    ddd = random.randint(11, 99)
    numero = random.randint(10000000, 99999999)

    celular = f"{ddd}9{numero:08d}"

    if formatado:
        return f"({celular[:2]}) {celular[2:7]}-{celular[7:]}"

    return celular



def gerar_email(nome=None):
    """
    Gera e-mail de teste usando example.com.
    """

    if nome:
        nome = ''.join(
            c for c in nome.lower()
            if c.isalnum()
        )

        if not nome:
            nome = "usuario"
    else:
        nomes = [
            "joao", "maria", "carlos", "ana",
            "pedro", "lucas", "gabriel",
            "enzo", "bruno", "juliana"
        ]

        nome = random.choice(nomes)

    numero = random.randint(1, 9999)

    return f"{nome}{numero}@example.com"



def gerar_placa():
    """
    Gera placa no formato Mercosul:
    ABC1D23
    """

    letras = ''.join(
        random.choices(string.ascii_uppercase, k=3)
    )

    numero1 = random.randint(0, 9)
    letra = random.choice(string.ascii_uppercase)
    numeros = _digitos(2)

    return f"{letras}{numero1}{letra}{numeros}"



def gerar_cnh():
    """
    Gera um número sintético de 11 dígitos.

    Observação:
    A CNH possui regras específicas de emissão e identificação.
    Aqui o objetivo é gerar dados para teste de campo/formulário.
    """

    return _digitos(11)



def gerar_rg():
    """
    Gera RG sintético dentro do tamanho aceito
    pelo seu validador.
    """

    return _digitos(random.randint(8, 9))



def gerar_cep(formatado=False):
    """
    Gera CEP sintético no formato esperado pelo formulário.
    """

    cep = _digitos(8)

    if formatado:
        return f"{cep[:5]}-{cep[5:]}"

    return cep



def gerar_cnae():
    """
    Gera um código CNAE com 7 dígitos.

    Para testes de formato, não significa necessariamente
    uma atividade econômica existente.
    """

    return _digitos(7)



def gerar_data_nascimento():
    """
    Gera uma data de nascimento sintética.
    """

    from datetime import date, timedelta

    inicio = date(1960, 1, 1)
    fim = date(2005, 12, 31)

    intervalo = (fim - inicio).days

    data = inicio + timedelta(
        days=random.randint(0, intervalo)
    )

    return data.strftime("%d/%m/%Y")



def gerar_nome():
    nomes = [
        "João", "Maria", "Carlos", "Ana",
        "Pedro", "Lucas", "Gabriel", "Juliana",
        "Bruno", "Mariana", "Rafael", "Larissa"
    ]

    sobrenomes = [
        "Silva", "Santos", "Oliveira",
        "Souza", "Costa", "Pereira",
        "Rodrigues", "Almeida", "Ferreira",
        "Gomes"
    ]

    return (
        f"{random.choice(nomes)} "
        f"{random.choice(sobrenomes)} "
        f"{random.choice(sobrenomes)}"
    )

if __name__ == "__main__":

    print("CPF:       ", gerar_cpf())
    print("CNPJ:      ", gerar_cnpj())
    print("Celular:   ", gerar_celular(True))
    print("E-mail:    ", gerar_email())
    print("Placa:     ", gerar_placa())
    print("CNH:       ", gerar_cnh())
    print("RG:        ", gerar_rg())
    print("CEP:       ", gerar_cep(True))
    print("CNAE:      ", gerar_cnae())
    print("Nascimento:", gerar_data_nascimento())
    print("Nome:      ", gerar_nome())