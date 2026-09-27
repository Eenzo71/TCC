import random
import string

def gerar_matricula():
    caracteres_permitidos = string.ascii_lowercase + string.digits
    
    matricula = ''.join(random.choices(caracteres_permitidos, k=8))
    
    return matricula

if __name__ == "__main__":
    matricula_gerada = gerar_matricula()
    print(f"Matrícula gerada: {matricula_gerada}")