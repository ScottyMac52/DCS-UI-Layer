[CmdletBinding()]
param([string] $Version)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Version = node (Join-Path $PSScriptRoot 'version.mjs') resolve $Version
if ($LASTEXITCODE -ne 0) { throw 'Failed to resolve the package version.' }
$PackageName = "Scott-DCS-UI-Layer-Control-Profiles-$Version"
$BuildRoot = Join-Path $RepoRoot '.build/ovgme'
$StageRoot = Join-Path $BuildRoot 'stage'
$Container = Join-Path $StageRoot $PackageName
$Dist = Join-Path $RepoRoot 'dist'
$Archive = Join-Path $Dist "$PackageName.zip"

Remove-Item $BuildRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item (Join-Path $Container 'Config/Input') -ItemType Directory -Force | Out-Null
New-Item (Join-Path $Container 'KNEEBOARD/UiLayer') -ItemType Directory -Force | Out-Null
New-Item $Dist -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $RepoRoot 'src/Config/Input/UiLayer') (Join-Path $Container 'Config/Input/UiLayer') -Recurse
Copy-Item (Join-Path $RepoRoot 'kneeboard/UiLayer/*') (Join-Path $Container 'KNEEBOARD/UiLayer')

$Readme = Get-Content (Join-Path $RepoRoot 'packaging/ovgme/README.TXT') -Raw
if (-not $Readme.Contains('{{VERSION}}')) { throw 'OvGME README is missing the version token.' }
$Readme.Replace('{{VERSION}}', $Version) | Set-Content (Join-Path $StageRoot 'README.TXT') -Encoding utf8
$Version | Set-Content (Join-Path $StageRoot 'VERSION.TXT') -Encoding utf8

Remove-Item $Archive -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $Container, (Join-Path $StageRoot 'README.TXT'), (Join-Path $StageRoot 'VERSION.TXT') -DestinationPath $Archive -CompressionLevel Optimal
$Hash = Get-FileHash $Archive -Algorithm SHA256
"$($Hash.Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($Archive))" | Set-Content (Join-Path $Dist 'SHA256SUMS.txt') -Encoding utf8
Write-Host "Created $Archive"

