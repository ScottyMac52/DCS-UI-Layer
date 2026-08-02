[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Script = Join-Path $PSScriptRoot 'Test-Collisions.ps1'

& $Script -InputRoot (Join-Path $RepoRoot 'tests/fixtures/clean')
if ($LASTEXITCODE -ne 0) { throw 'Clean collision fixture failed.' }

$FailedAsExpected = $false
try {
    & $Script -InputRoot (Join-Path $RepoRoot 'tests/fixtures/collision')
} catch {
    $FailedAsExpected = $_.Exception.Message -match 'Reserved UI Layer chord collision'
}
if (-not $FailedAsExpected) { throw 'Collision fixture did not produce the expected failure.' }

Write-Host 'Collision fixture validation passed.'

