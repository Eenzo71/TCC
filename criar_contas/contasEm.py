import os
import geradorEmailEmpresa
import geradorRazaoSocial
import geradorNomeFantasia
import geradorCnpj
import geradorNome
import geradorCpf
import geradorCelular
import geradorCep
import geradorNaturezaJuridica
import geradorCnae
import geradorDadosOperacionais

def compilar_conta_empresa():
    email_dados = geradorEmailEmpresa.gerar()
    endereco_dados = geradorCep.gerar_cep_e_numero()
    natureza = geradorNaturezaJuridica.gerar_natureza_juridica()
    cnae = geradorCnae.gerar_cnae()
    operacional = geradorDadosOperacionais.gerar_dados_operacionais()
    
    conta = {
        "E-mail Corporativo": email_dados["email"],
        "Senha": email_dados["senha"],
        "Razão Social": geradorRazaoSocial.gerar_razao_social(),
        "Nome Fantasia": geradorNomeFantasia.gerar_nome_fantasia(),
        "CNPJ": geradorCnpj.gerar_cnpj_valido(),
        "Natureza Jurídica": natureza.get("natureza", ""),
        "CNAE Principal": f"{cnae.get('codigo', '')} - {cnae.get('descricao', '')}",
        "Nome Responsável": geradorNome.gerar_nome_completo(),
        "CPF Responsável": geradorCpf.gerar_cpf_valido(),
        "Telefone Empresa": geradorCelular.gerar_celular_valido(),
        "Sede CEP": endereco_dados.get("cep", ""),
        "Sede Número": endereco_dados.get("numero", ""),
        "Transporte": operacional["tipo_transporte"],
        "Capacidade": operacional["capacidade_total"],
        "Turnos": operacional["turnos_atendidos"],
        "Monitor": operacional["possui_monitor"]
    }
    
    texto_saida = (
        f"--- CONTA EMPRESA / TRANSPORTADOR ---\n"
        f"Acesso: {conta['E-mail Corporativo']} | Senha: {conta['Senha']}\n"
        f"Jurídico: {conta['Razão Social']} ({conta['Nome Fantasia']}) - CNPJ: {conta['CNPJ']}\n"
        f"Enquadramento: {conta['Natureza Jurídica']} | CNAE: {conta['CNAE Principal']}\n"
        f"Responsável: {conta['Nome Responsável']} (CPF: {conta['CPF Responsável']}) - Tel: {conta['Telefone Empresa']}\n"
        f"Garagem: CEP {conta['Sede CEP']}, Número {conta['Sede Número']}\n"
        f"Operacional: {conta['Transporte']} (Capacidade: {conta['Capacidade']} lugares) | Monitor: {conta['Monitor']} | Turnos: {conta['Turnos']}\n"
        f"-------------------------------------\n\n"
    )
    
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'contasEmpresas.txt')
    
    with open(caminho, 'a', encoding='utf-8') as f:
        f.write(texto_saida)
        
    print(f"Conta de Empresa salva em {caminho}")

if __name__ == "__main__":
    compilar_conta_empresa()