[CmdletBinding()]
param([string] $Version)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Version = node (Join-Path $PSScriptRoot 'version.mjs') resolve $Version
if ($LASTEXITCODE -ne 0) { throw 'Failed to resolve the package version.' }
$PackageName = "Scott-DCS-UI-Layer-Control-Profiles-$Version"
$Archive = Join-Path $RepoRoot "dist/$PackageName.zip"
$ExpandRoot = Join-Path $RepoRoot '.build/package-test'
if (-not (Test-Path $Archive -PathType Leaf)) { throw "Missing $Archive" }
Remove-Item $ExpandRoot -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive $Archive $ExpandRoot

$Expected = @(
    "$PackageName/Config/Input/UiLayer/modifiers.lua",
    "$PackageName/Config/Input/UiLayer/joystick/F16 MFD 3 {C5BE49A0-2342-11ee-8001-444553540000}.diff.lua",
    "$PackageName/KNEEBOARD/01-MFD3-UI-LAYER.png",
    'README.TXT',
    'VERSION.TXT'
)
foreach ($Relative in $Expected) {
    if (-not (Test-Path (Join-Path $ExpandRoot $Relative) -PathType Leaf)) { throw "Package is missing $Relative" }
}
if (Test-Path (Join-Path $ExpandRoot "$PackageName/KNEEBOARD/UiLayer")) {
    throw 'UI Layer kneeboard must be installed at the global KNEEBOARD root.'
}
if ((Get-Content (Join-Path $ExpandRoot 'VERSION.TXT') -Raw).Trim() -ne $Version) { throw 'VERSION.TXT mismatch.' }
$UnexpectedModules = Get-ChildItem (Join-Path $ExpandRoot "$PackageName/Config/Input") -Directory | Where-Object Name -ne 'UiLayer'
if ($UnexpectedModules) { throw "Package contains an aircraft-specific input directory: $($UnexpectedModules.Name -join ', ')" }
& (Join-Path $PSScriptRoot 'Test-Profile.ps1')
Write-Host 'OvGME package validation passed.'
