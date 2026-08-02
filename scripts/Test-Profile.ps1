[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent $PSScriptRoot
$Manifest = Get-Content (Join-Path $RepoRoot 'config/reserved-inputs.json') -Raw | ConvertFrom-Json
$ProfilePath = Get-ChildItem (Join-Path $RepoRoot 'src/Config/Input/UiLayer/joystick') -Filter '*.diff.lua' -File
if (@($ProfilePath).Count -ne 1) { throw 'Exactly one UI Layer joystick profile is required.' }
$Profile = Get-Content $ProfilePath.FullName -Raw
$Modifiers = Get-Content (Join-Path $RepoRoot 'src/Config/Input/UiLayer/modifiers.lua') -Raw

if ($Manifest.bindings.Count -ne 10) { throw 'The initial manifest must contain ten exported bindings.' }
if (@($Manifest.bindings | Where-Object { $_.category -notin 'General', 'VR', 'Kneeboard' }).Count -ne 0) {
    throw 'A binding uses a category outside General, Kneeboard, and VR.'
}
if (-not $Manifest.acceptedModifierReuse.enabled -or $Manifest.acceptedModifierReuse.decision -ne 'Option 3') {
    throw 'The accepted Option 3 modifier-reuse decision is missing.'
}

$Supported = @($Manifest.modifiers | Where-Object status -eq 'supported')
if ($Supported.Count -ne 2) { throw 'Exactly two modifier paths must be supported in the initial profile.' }
$Tuples = [Collections.Generic.HashSet[string]]::new()
foreach ($Binding in $Manifest.bindings) {
    $EscapedCommand = [regex]::Escape([string]$Binding.command)
    $Pattern = '(?ms)^\s*\["' + $EscapedCommand + '"\]\s*=\s*\{(?<block>.*?)(?=^\t\t\["d|^\t\},\s*$)'
    $Match = [regex]::Match($Profile, $Pattern)
    if (-not $Match.Success) { throw "Missing command $($Binding.command)." }
    $Block = $Match.Groups['block'].Value
    if ($Block -notmatch ('\["name"\]\s*=\s*"' + [regex]::Escape([string]$Binding.name) + '"')) {
        throw "Command $($Binding.command) has the wrong display name."
    }
    $KeyCount = [regex]::Matches($Block, ('\["key"\]\s*=\s*"' + [regex]::Escape([string]$Binding.key) + '"')).Count
    if ($KeyCount -ne $Supported.Count) { throw "$($Binding.name) must contain one key entry per supported modifier." }
    foreach ($Modifier in $Supported) {
        $ModifierCount = [regex]::Matches($Block, ('"' + [regex]::Escape([string]$Modifier.name) + '"')).Count
        if ($ModifierCount -ne 1) { throw "$($Binding.name) must contain $($Modifier.name) exactly once." }
        if (-not $Tuples.Add("$($Binding.key)|$($Modifier.name)")) { throw "Duplicate reserved tuple for $($Binding.key) and $($Modifier.name)." }
    }
}

foreach ($Modifier in $Supported) {
    foreach ($Expected in @($Modifier.name, $Modifier.device, $Modifier.key)) {
        if ($Modifiers -notmatch [regex]::Escape([string]$Expected)) { throw "modifiers.lua is missing $Expected." }
    }
}
$Pending = @($Manifest.modifiers | Where-Object name -eq 'AVA_F18_S3')
if ($Pending.Count -ne 1 -or $Pending[0].status -ne 'awaiting-current-export' -or $null -ne $Pending[0].device) {
    throw 'AVA_F18_S3 must remain explicitly pending until a verified export is supplied.'
}

Write-Host 'UI Layer profile validation passed.'
