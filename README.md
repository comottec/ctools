# CTools

Comottec Tools é um aplicativo por linha de comando, que contém um conjuto de feraramentas para consultores e DevOps com o intuito de facilitar e automatizar tarefas diárias.

## Funcionalidades:
* Listar portas e serviços em um conjunto de Appservers;
* Listar configurações de environments em um conjunto de Appservers;
* Atualizar o RPO (repositório de objetos) em vários Appservers com um único comando;

### Em breve:
* Parar/Iniciar o serviço de todos os Appservers;
* Criar environments em todos os Appservers;
* Criar configuração de master 
* Criar configuração de broker
* Criar novos slots de Appsever para ativar no master;

## Requisitos:

* Sistema operacional Windows.
* .Net Framework 4.00 ou superior.
* Powershell 5.0 ou superior.

## Configurações:

Para facilitar o uso você pode opcionalmente criar o arquivo Config.json na pasta C:\Comottec\CTools conforme abaixo:
```json
{
  "ProtheusBin": "C:\\totvs12\\protheus\\bin",
  "RpoFileName": "tttp120.rpo"
}
```
Com essa configuração definida, não será necessário passar os paramêtros ProtheusBin ou RpoFileName para o aplicativo.

## Instalação:

Baixar o repostório do GitHub e extrair para a pasta C:\Comottec\CTools

Recomenda-se colocar essa pasta no path do sistema opercional.

## Sintaxe:

### List
    CTools list [[-ProtheusBin] <String>] [-printEnv] [[-Environment] <String>]
    
    Parametros:
    ProtheusBin = Caminho para a pasta <Protheus\Bin>
    printEnv = Deseja listar os environments
    Environment = Filtrar os Appservers em que encontrou o environment pesquisado

### Update
    CTools update [[-ProtheusBin] <String>] [-Environment] <String> [[-SourcePath] <String>] [[-RpoFileName] <String>] 

    Parametros:
    ProtheusBin = Caminho para a pasta <Protheus\Bin>
    Environment = Environment a ser atualizado
    SourcePath = Nova pasta a ser atualizada no SourcePath os Ini's (essa pasta deve existir)
    RpoFileName = Nome do arquivo de RPO

## Exemplos de uso:

#### Listagem de Appservers:
    CTools.exe list  
![list](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list.png)

#### Listagem de Environments:
    CTools.exe list -printEnv
![list-printenv](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list-printenv.png)

#### Listagem de um Environment:
    CTools.exe list -Environment top
![list-environment](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list-environment.png)

#### Update de SourcePath nos Appservers:
    CTools.exe update -Environment top -SourcePath=C:\tovs12\protheus\apo\top\v002
![list-update](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-update.png)

