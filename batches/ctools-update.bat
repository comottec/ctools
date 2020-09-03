@echo off

:DigitaEnv
set /p Environment="Digite o nome do Environment:"
IF not '%Environment%' == '' (goto DigitaSource)

set /p Environment="Digite o Environment ou ENTER para sair:"

IF '%Environment%' == '' (goto End)

:
set /p SourcePath="Digite o nome do novo SourcePath:"

IF not '%SourcePath%' == '' (goto Confirm)

:DigitaSource
set /p SourcePath="Digite o novo SourcePath:"
IF not '%SourcePath%' == '' (goto Confirm)

set /p SourcePath="Digite o Environment ou ENTER para sair:"

IF '%SourcePath%' == '' (goto End)

:Confirm
set /p ConfirmFlag="Confirma update do RPO (S/N): "

IF '%ConfirmFlag%' == 's' (goto RunUpdate)
IF '%ConfirmFlag%' == 'S' (goto RunUpdate)

goto End

:RunUpdate

SET binDir=%ProtheusBin%
IF "%binDir%" == "" (call ctools-config.bat)

ctools update --ProtheusBin %binDir% --Environment %Environment% --SourcePath %SourcePath%
pause

:End
