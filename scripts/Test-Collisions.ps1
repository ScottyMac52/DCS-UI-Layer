[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string] $InputRoot
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Manifest = Get-Content (Join-Path $RepoRoot 'config/reserved-inputs.json') -Raw | ConvertFrom-Json
$Supported = @($Manifest.modifiers | Where-Object status -eq 'supported')
$Conflicts = [Collections.Generic.List[string]]::new()

Get-ChildItem $InputRoot -Recurse -Filter '*.diff.lua' -File | ForEach-Object {
    $Normalized = $_.FullName.Replace('\', '/')
    if ($Normalized -match '/UiLayer/joystick/') { return }
    if ($_.Name -notmatch [regex]::Escape($Manifest.device.guid)) { return }
    $Text = Get-Content $_.FullName -Raw
    foreach ($Binding in $Manifest.bindings) {
        foreach ($Modifier in $Supported) {
            $Key = [regex]::Escape([string]$Binding.key)
            $Reformer = [regex]::Escape([string]$Modifier.name)
            $Pattern = '(?ms)\["key"\]\s*=\s*"' + $Key + '".{0,500}?\["reformers"\].{0,500}?"' + $Reformer + '"'
            if ($Text -match $Pattern) {
                $Conflicts.Add("$($_.FullName): $($Binding.key) + $($Modifier.name)")
            }
        }
    }
}

if ($Conflicts.Count -gt 0) {
    throw "Reserved UI Layer chord collision(s):`n$($Conflicts -join "`n")"
}
Write-Host "No reserved UI Layer chord collisions under $InputRoot."
