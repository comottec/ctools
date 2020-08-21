# CTools

Comottec Tools é um aplicativo por linha de comando, que contém um conjuto de feraramentas para consultores e DevOps com o intuito de facilitar e automatizar tarefas diárias.

# Configurações:

Para facilitar o uso você pode opcionalmente criar o arquivo Config.json na pasta C:\Comottec\CTools conforme abaixo:
{
  "ProtheusBin": "C:\Totvs12\Protheus\bin",
  "RpoFileName": "tttp120.rpo"
}

Com essa configuração definida, não será necessário passar os paramêtros ProtheusBin ou RpoFileName para o aplicativo.

# Funcionalidades:

Listagem de Appservers:
CTools.exe list  

A ferramenta irá procurar todos os appserver.exe instalados a partir da pasta definida em ProtheusBin, e apreesantando informações como Porta, Environment, Serviço, Estado do Serviço, etc.





