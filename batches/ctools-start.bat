@echo off
NET FILE 1>NUL 2>NUL
IF '%errorlevel%' == '0' ( goto gotPrivileges ) else ( goto getPrivileges )

:getPrivileges
	echo This script needs administrative privileges.
	goto End

:gotPrivileges	

SET binDir=%ProtheusBin%
IF "%binDir%" == "" (call ctools-config.bat)

ctools start

:End
pause
