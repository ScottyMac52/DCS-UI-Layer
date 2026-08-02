[CmdletBinding()]
param([string] $Version)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Version = node (Join-Path $PSScriptRoot 'version.mjs') resolve $Version
if ($LASTEXITCODE -ne 0) { throw 'Failed to resolve the release version.' }
$OvgmeName = "Scott-DCS-UI-Layer-Control-Profiles-$Version.zip"
$BundleName = "Scott-DCS-UI-Layer-Complete-Package-$Version"
$Dist = Join-Path $RepoRoot 'dist'
$BuildRoot = Join-Path $RepoRoot '.build/release'
$BundleRoot = Join-Path $BuildRoot $BundleName
$BundleArchive = Join-Path $Dist "$BundleName.zip"
if (-not (Test-Path (Join-Path $Dist $OvgmeName) -PathType Leaf)) { throw 'Build the OvGME archive first.' }

Remove-Item $BuildRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item (Join-Path $BundleRoot 'OVGME') -ItemType Directory -Force | Out-Null
New-Item (Join-Path $BundleRoot 'Documentation') -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $Dist $OvgmeName) (Join-Path $BundleRoot 'OVGME')
Copy-Item (Join-Path $RepoRoot 'README.md') (Join-Path $BundleRoot 'Documentation')
Copy-Item (Join-Path $RepoRoot 'CHANGELOG.md') (Join-Path $BundleRoot 'Documentation')
Copy-Item (Join-Path $RepoRoot 'docs/*') (Join-Path $BundleRoot 'Documentation')
$Notes = Get-Content (Join-Path $RepoRoot 'packaging/release/RELEASE-NOTES.md') -Raw
$Notes.Replace('{{VERSION}}', $Version) | Set-Content (Join-Path $BundleRoot 'RELEASE-NOTES.md') -Encoding utf8

$Targets = Get-ChildItem $BundleRoot -Recurse -File | Sort-Object FullName
$Checksums = foreach ($File in $Targets) {
    $Hash = Get-FileHash $File.FullName -Algorithm SHA256
    $Relative = [IO.Path]::GetRelativePath($BundleRoot, $File.FullName).Replace('\', '/')
    "$($Hash.Hash.ToLowerInvariant())  $Relative"
}
$Checksums | Set-Content (Join-Path $BundleRoot 'SHA256SUMS.txt') -Encoding utf8
Remove-Item $BundleArchive -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $BundleRoot -DestinationPath $BundleArchive -CompressionLevel Optimal

$ReleaseChecksums = Get-ChildItem (Join-Path $Dist '*.zip') | Sort-Object Name | ForEach-Object {
    $Hash = Get-FileHash $_.FullName -Algorithm SHA256
    "$($Hash.Hash.ToLowerInvariant())  $($_.Name)"
}
$ReleaseChecksums | Set-Content (Join-Path $Dist 'SHA256SUMS.txt') -Encoding utf8
Write-Host "Created $BundleArchive"

