# CTools

Comottec Tools é um aplicativo por linha de comando, que contém um conjuto de feraramentas para consultores e DevOps com o intuito de facilitar e automatizar tarefas diárias.

## Funcionalidades:
* Listar portas e serviços em um conjunto de Appservers;
* Listar configurações de environments em um conjunto de Appservers;
* Atualizar o RPO (repositório de objetos) em vários Appservers com um único comando;
* Parar/Iniciar o serviço de todos os Appservers;

### Em breve:
* Criar environments em todos os Appservers;
* Criar configuração de master 
* Criar configuração de broker
* Criar novos slots de Appsever para ativar no master;

## Configurações:

Para facilitar o uso você pode opcionalmente criar a váriavel de ambiente ProtheusBin conforme abaixo:

### No Windows:
    SET ProtheusBin=C:\Totvs12\Protheus\Bin

Com essa configuração definida, não será necessário passar o paramêtro ProtheusBin para o aplicativo.

## Instalação:

Baixar o instalador no link abaixo:

https://raw.githubusercontent.com/comottec/ctools/master/distr/buildSetup/setup.exe

Ou

Baixar o repostório do GitHub: git clone https://github.com/comottec/ctools.git ctools

Recomenda-se colocar essa pasta no path do sistema opercional.

## Sintaxe:

### List
    CTools list [[--ProtheusBin] <String>] [--printEnv] [[--Environment] <String>] [[--Port] <Number>]
    ou
    CTools list [[-b] <String>] [--pe] [[-e] <String>] [[-p] <Number>]
    
    Parametros:
    ProtheusBin = Caminho para a pasta <Protheus\Bin>
    printEnv = Deseja listar os environments
    Environment = Filtrar os Appservers em que encontrou o environment pesquisado
    Port = Filtrar os Appservers em que encontrou a porta pesquisada

### Update
    CTools update [[--ProtheusBin] <String>] --Environment <String> --SourcePath <String> [[--Port] <Number>] 
    ou
    CTools update [[-b] <String>] -e <String> -s <String> [[-p] <Number>] 

    Parametros:
    ProtheusBin = Caminho para a pasta <Protheus\Bin>
    Environment = Environment a ser atualizado
    SourcePath = Nova pasta a ser atualizada no SourcePath os Ini's (essa pasta deve existir)
    Port = Caso deseje atualizar apenas um Appserver em especifico

### Start
    CTools start [[--Port] <Number>]
    ou
    CTools start [[-p] <Number>]

    Port = Caso deseje iniciar o serviço de apenas um Appserver em especifico

### Stop
    CTools stop [[--Port] <Number>]
    ou
    CTools stop [[-p] <Number>]

    Port = Caso deseje parar o serviço de apenas um Appserver em especifico

## Exemplos de uso:

#### Listagem de Appservers:
    CTools.exe list  
![list](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list.png)

#### Listagem de Environments:
    CTools.exe list --printEnv
![list-printenv](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list-printenv.png)

#### Listagem de um Environment:
    CTools.exe list --Environment top
![list-environment](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-list-environment.png)

#### Update de SourcePath nos Appservers:
    CTools.exe update --Environment top --SourcePath=C:\tovs12\protheus\apo\top\v002
![list-update](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-update.png)

#### Para rodar os comandos Start ou Stop será necessário privilégios administrativos:
![admin](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-privilegies.png)

#### Start
    CTools.exe start
![start](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-start.png)

#### Stop
    CTools.exe stop
![start](https://raw.githubusercontent.com/comottec/ctools/master/imagens/ctools-stop.png)
