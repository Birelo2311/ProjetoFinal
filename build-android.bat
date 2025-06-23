@echo off
REM Configurar variável para desativar CMake do Reanimated
set REANIMATED_DISABLE_CMAKE=true

REM Limpar build antigo
cd android
call gradlew clean

REM Iniciar build release
call gradlew assembleRelease

pause
