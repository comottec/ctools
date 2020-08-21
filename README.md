# CTools

Comottec Tools é um aplicativo por linha de comando, que contém um conjuto de feraramentas para consultores e DevOps com o intuito de facilitar e automatizar tarefas diárias.

## Funcionalidades principais:

* Listar portas e serviços em um conjunto de Appservers;
* Listar configurações de environments em um conjunto de Appservers;
* Atualizar o RPO (repositório de objetos) em vários Appservers com um único comando;

### Em breve:
* Criar environments em todos os Appservers;
* Criar configuração de master
* Criar configuração de broker
* Criar novos slots de Appsever para ativar no master;

## Configurações:

Para facilitar o uso você pode opcionalmente criar o arquivo Config.json na pasta C:\Comottec\CTools conforme abaixo:
```json
{
  "ProtheusBin": "C:\\totvs12\\protheus\\bin",
  "RpoFileName": "tttp120.rpo"
}
```
Com essa configuração definida, não será necessário passar os paramêtros ProtheusBin ou RpoFileName para o aplicativo.

## Funcionalidades:

Listagem de Appservers:
CTools.exe list  

A ferramenta irá procurar todos os appserver.exe instalados a partir da pasta definida em ProtheusBin, e apreesantando informações como Porta, Environment, Serviço, Estado do Serviço, etc.





