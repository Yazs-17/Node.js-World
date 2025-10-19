@echo off
chcp 65001 >nul
:: ============================
:: 自动创建 Express 模块文档目录
:: ============================

setlocal enabledelayedexpansion

set /p name=请输入知识点名称（例如 promise 或 prototype）: 


set folderName=%name%

if not exist "%folderName%" (
    mkdir "%folderName%"
    echo 📁 已创建目录：%folderName%
) else (
    echo ⚠️ 目录 "%folderName%" 已存在！
)

set filePath=%folderName%\README.Syntax.%name%.md
if exist "%filePath%" (
    echo ⚠️ 文件已存在：%filePath%
) else (
    (
        echo ## Description
        echo.
        echo ## Usage
        echo.
        echo ## Installation
        echo.
        echo ## Test
        echo.
    ) > "%filePath%"
    echo ✅ 已创建文件：%filePath%
)

pause
