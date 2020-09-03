@ECHO OFF
SET binDir=%ProtheusBin%
IF NOT "%binDir%" == "" IF EXIST %binDir% (goto End)

SET /p binDir=Digite o path para ProtheusBin: 
IF "%binDir%" == "" (GOTO End)
IF not EXIST "%binDir%" (GOTO End)

SETX ProtheusBin "%binDir%"
Echo Variavel de ambiente ProtheusBin definida como %binDir%

:End
