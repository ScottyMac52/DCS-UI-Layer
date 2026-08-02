[CmdletBinding()]
param([string] $Version)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Version = node (Join-Path $PSScriptRoot 'version.mjs') resolve $Version
if ($LASTEXITCODE -ne 0) { throw 'Failed to resolve the release version.' }
$BundleName = "Scott-DCS-UI-Layer-Complete-Package-$Version"
$Archive = Join-Path $RepoRoot "dist/$BundleName.zip"
$ExpandRoot = Join-Path $RepoRoot '.build/release-test'
if (-not (Test-Path $Archive -PathType Leaf)) { throw "Missing $Archive" }
Remove-Item $ExpandRoot -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $Archive $ExpandRoot
$Root = Join-Path $ExpandRoot $BundleName
foreach ($Relative in @(
    "OVGME/Scott-DCS-UI-Layer-Control-Profiles-$Version.zip",
    'Documentation/README.md',
    'Documentation/INSTALLATION.md',
    'Documentation/CONTROL-MAPPINGS.md',
    'Documentation/MODIFIER-VARIANTS.md',
    'RELEASE-NOTES.md',
    'SHA256SUMS.txt'
)) {
    if (-not (Test-Path (Join-Path $Root $Relative) -PathType Leaf)) { throw "Release is missing $Relative" }
}
if ((Get-Content (Join-Path $Root 'RELEASE-NOTES.md') -Raw).Contains('{{VERSION}}')) { throw 'Release notes version token was not replaced.' }
Write-Host 'Complete release validation passed.'

