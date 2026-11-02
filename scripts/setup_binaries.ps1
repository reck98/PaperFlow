$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$binDir = Join-Path $PSScriptRoot "..\bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null
}

# 1. Download Typst
$typstExe = Join-Path $binDir "typst.exe"
if (-not (Test-Path $typstExe)) {
    Write-Host "Downloading Typst..."
    $typstZip = Join-Path $binDir "typst.zip"
    $typstUrl = "https://github.com/typst/typst/releases/download/v0.13.0/typst-x86_64-pc-windows-msvc.zip"
    try {
        Invoke-WebRequest -Uri $typstUrl -OutFile $typstZip -UseBasicParsing
    } catch {
        Write-Host "Trying v0.12.0..."
        $typstUrl = "https://github.com/typst/typst/releases/download/v0.12.0/typst-x86_64-pc-windows-msvc.zip"
        Invoke-WebRequest -Uri $typstUrl -OutFile $typstZip -UseBasicParsing
    }
    
    $typstExtract = Join-Path $binDir "typst_extracted"
    Expand-Archive -Path $typstZip -DestinationPath $typstExtract -Force
    $extractedExe = Get-ChildItem -Path $typstExtract -Filter "typst.exe" -Recurse | Select-Object -First 1
    if ($extractedExe) {
        Copy-Item -Path $extractedExe.FullName -Destination $typstExe -Force
    }
    Remove-Item -Recurse -Force $typstExtract
    Remove-Item -Force $typstZip
    Write-Host "Typst installed to $typstExe"
}

# 2. Download Pandoc
$pandocExe = Join-Path $binDir "pandoc.exe"
if (-not (Test-Path $pandocExe)) {
    Write-Host "Downloading Pandoc..."
    $pandocZip = Join-Path $binDir "pandoc.zip"
    $pandocUrl = "https://github.com/jgm/pandoc/releases/download/3.6.3/pandoc-3.6.3-windows-x86_64.zip"
    try {
        Invoke-WebRequest -Uri $pandocUrl -OutFile $pandocZip -UseBasicParsing
    } catch {
        Write-Host "Trying 3.6..."
        $pandocUrl = "https://github.com/jgm/pandoc/releases/download/3.6/pandoc-3.6-windows-x86_64.zip"
        Invoke-WebRequest -Uri $pandocUrl -OutFile $pandocZip -UseBasicParsing
    }
    
    $pandocExtract = Join-Path $binDir "pandoc_extracted"
    Expand-Archive -Path $pandocZip -DestinationPath $pandocExtract -Force
    $extractedExe = Get-ChildItem -Path $pandocExtract -Filter "pandoc.exe" -Recurse | Select-Object -First 1
    if ($extractedExe) {
        Copy-Item -Path $extractedExe.FullName -Destination $pandocExe -Force
    }
    Remove-Item -Recurse -Force $pandocExtract
    Remove-Item -Force $pandocZip
    Write-Host "Pandoc installed to $pandocExe"
}

Write-Host "Binaries setup complete!"
