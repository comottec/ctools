@echo off

SET binDir=%ProtheusBin%
IF "%binDir%" == "" (call ctools-config.bat)

ctools list -b %binDir%
pause