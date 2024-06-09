@echo off
setlocal enabledelayedexpansion
rem This file is made for Running with Windows OS
rem Argument is used "FoldersName{arg}.txt"  ex. All

set "folder_list=G:\FoldersName\FoldersName%1.txt"
set "base_directory=G:\\"

if not exist "%folder_list%" (
    echo Error: FolderList does not exist.
    exit /b 1
)

if not exist "%base_directory%" (
    echo Error: BaseDirectory does not exist.
    exit /b 1
)

for /f "usebackq delims=" %%i in ("%folder_list%") do (
    set "folder_name=%%i"

    call ts-node .\analyzeLog.ts "!folder_name!" > "G:\log\analyze0225\%%i.txt"

    if !errorlevel! equ 0 (
        echo Success: !folder_name!
    ) else (
        echo Error: Failed to analyze %%i. Code: !errorlevel!
    )

)

echo Process is complete.
endlocal
