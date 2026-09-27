import os
import contasRes
import contasAlMe
import contasAlMa
import contasEm
import geradorCpf
import geradorCelular
import geradorCep
import geradorNome
import geradorMatricula
import geradorCnpj
import geradorRazaoSocial
import geradorNomeFantasia
import geradorDataNascimento
import geradorNaturezaJuridica
import geradorCnae
import geradorDadosOperacionais
import geradorEscola

def salvar_dado_separado(nome_dado, valor_dado):
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho = os.path.join(diretorio, 'dadosseparados.txt')
    
    if isinstance(valor_dado, dict):
        texto_formatado = ", ".join([f"{k}: {v}" for k, v in valor_dado.items()])
    else:
        texto_formatado = str(valor_dado)
        
    with open(caminho, 'a', encoding='utf-8') as f:
        f.write(f"--- {nome_dado} ---\n")
        f.write(f"{texto_formatado}\n")
        f.write("-" * 30 + "\n\n")
        
    print(f"\n✅ {nome_dado} gerado e salvo em 'dadosseparados.txt'!")
    print(f"Resultado: {texto_formatado}\n")

def menu_especifico():
    opcoes = {
        1: ("CPF", geradorCpf.gerar_cpf_valido),
        2: ("Celular", geradorCelular.gerar_celular_valido),
        3: ("CEP e Número", geradorCep.gerar_cep_e_numero),
        4: ("Nome Completo", geradorNome.gerar_nome_completo),
        5: ("Matrícula", geradorMatricula.gerar_matricula),
        6: ("CNPJ", geradorCnpj.gerar_cnpj_valido),
        7: ("Razão Social", geradorRazaoSocial.gerar_razao_social),
        8: ("Nome Fantasia", geradorNomeFantasia.gerar_nome_fantasia),
        9: ("Data de Nascimento", geradorDataNascimento.gerar_data_nascimento_maior),
        10: ("Data de Nascimento", geradorDataNascimento.gerar_data_nascimento_menor),
        11: ("Natureza Jurídica", geradorNaturezaJuridica.gerar_natureza_juridica),
        12: ("CNAE", geradorCnae.gerar_cnae),
        13: ("Dados Operacionais", geradorDadosOperacionais.gerar_dados_operacionais),
        14: ("Escola e Turma", geradorEscola.gerar_escola_e_turma)
    }

    print("\n--- GERAR DADO ESPECÍFICO ---")
    for num, (nome, _) in opcoes.items():
        print(f"[{num}] {nome}")
        
    try:
        escolha = int(input("\nDigite o número da opção desejada: "))
        if escolha in opcoes:
            nome, funcao = opcoes[escolha]
            resultado = funcao()
            salvar_dado_separado(nome, resultado)
        else:
            print("❌ Opção inválida.")
    except ValueError:
        print("❌ Entrada inválida. Digite apenas o número.")

def menu_contas():
    mapa_contas = {
        1: ("Responsável", contasRes.compilar_conta_responsavel),
        2: ("Aluno Menor", contasAlMe.compilar_conta_aluno_menor),
        3: ("Aluno Maior", contasAlMa.compilar_conta_aluno_maior),
        4: ("Empresa", contasEm.compilar_conta_empresa)
    }

    print("\n--- CRIAR CONTAS ---")
    for num, (nome, _) in mapa_contas.items():
        print(f"[{num}] Conta {nome}")
        
    entrada_escolhas = input("\nQuais contas deseja criar? (ex: 1 ou 1,2,4): ")
    
    try:
        escolhas_lista = [int(x.strip()) for x in entrada_escolhas.split(",")]
        
        for e in escolhas_lista:
            if e not in mapa_contas:
                print(f"❌ Opção {e} é inválida e será ignorada.")
        
        escolhas_validas = [e for e in escolhas_lista if e in mapa_contas]
        
        if not escolhas_validas:
            print("Nenhuma opção válida selecionada.")
            return

        if len(escolhas_validas) == 1:
            entrada_qtd = input(f"Quantas contas de '{mapa_contas[escolhas_validas[0]][0]}' deseja criar? (ex: 10): ")
        else:
            nomes_selecionados = " / ".join([mapa_contas[e][0] for e in escolhas_validas])
            print(f"\nContas selecionadas: {nomes_selecionados}")
            entrada_qtd = input(f"Digite as quantidades na mesma ordem, separadas por vírgula (ex: se quer 15, 5, 10 digite assim): ")
            
        qtds_lista = [int(q.strip()) for q in entrada_qtd.split(",")]
        
        if len(qtds_lista) != len(escolhas_validas):
            print(f"❌ Erro: Você escolheu {len(escolhas_validas)} tipos de conta, mas forneceu {len(qtds_lista)} quantidades.")
            return
            
        print("\n⏳ Iniciando geração de contas...\n")
        for i, escolha_id in enumerate(escolhas_validas):
            nome_conta, funcao_geradora = mapa_contas[escolha_id]
            quantidade = qtds_lista[i]
            
            for _ in range(quantidade):
                funcao_geradora()
                
        print("\n✅ Todas as contas solicitadas foram geradas com sucesso!")

    except ValueError:
        print("❌ Entrada inválida. Certifique-se de digitar os números corretamente, separados por vírgula.")

def main():
    while True:
        print("\n" + "=" * 40)
        print("  PAINEL DE GERAÇÃO DE DADOS MOCKADOS")
        print("=" * 40)
        print("[1] Criar Contas Completas")
        print("[2] Gerar Dado Específico (Isolado)")
        print("[0] Sair")
        
        opcao = input("\nO que deseja fazer? ")
        
        if opcao == "1":
            menu_contas()
        elif opcao == "2":
            menu_especifico()
        elif opcao == "0":
            print("Saindo do sistema...")
            break
        else:
            print("❌ Opção inválida. Digite 1, 2 ou 0.")

if __name__ == "__main__":
    main()