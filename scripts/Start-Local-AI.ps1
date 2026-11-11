# Starts ChanSeller's local AI service without activation scripts.
# If PowerShell blocks this helper, use the manual .venv\Scripts\python.exe commands from README.
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot
$PythonExe = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Host "Creating .venv with Python 3.11..." -ForegroundColor Cyan
    & py -3.11 -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw "Could not create .venv. Install Python 3.11 or use the manual commands in README." }
}
Write-Host "Installing local AI requirements..." -ForegroundColor Cyan
& $PythonExe -m pip install -r backend\requirements.txt
if ($LASTEXITCODE -ne 0) { throw "Python dependency installation failed." }
Write-Host "ChanSeller image AI listening at http://127.0.0.1:8000" -ForegroundColor Green
& $PythonExe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
