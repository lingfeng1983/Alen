@echo off
chcp 65001 >nul
echo ========================================
echo     启动卡片式便签工具
echo ========================================
echo.

REM 尝试使用pythonw启动(Windows GUI模式,无控制台窗口)
where pythonw >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 pythonw 启动卡片式界面...
    start pythonw sticky_notes_card.py
    echo 便签工具已启动!
    timeout /t 2 >nul
    exit
)

REM 备用方案:使用python启动
where python >nul 2>&1
if %errorlevel% == 0 (
    echo 使用 python 启动卡片式界面...
    start python sticky_notes_card.py
    echo 便签工具已启动!
    timeout /t 2 >nul
    exit
)

echo.
echo [错误] 未找到Python!
echo 请确保已安装Python并添加到系统PATH
echo.
pause
