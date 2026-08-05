# DCS UI Layer

Scott's globally active DCS UI Layer profile for simulator and VR controls on Thrustmaster Cougar MFD 3.

The initial profile preserves the ten assignments exported from DCS and makes each chord available through either of these momentary modifiers:

- VKB F-14 Gunfighter `BTN7` (`VKB_F14_BTN7`)
- Thrustmaster AVA with F-16/Warthog grip `S3` / `JOY_BTN3` (`AVA_F16_S3`)

The AVA + F/A-18 grip is intentionally not guessed. Its S3 variant will be added after a current UI Layer modifier export supplies the exact device identity and HID button.

## Design rules

- The package writes only `Config\Input\UiLayer` and the global `KNEEBOARD\01-MFD3-UI-LAYER.png` page.
- Only General and VR commands from Scott's current export are shipped in the initial release. Kneeboard and F10 bindings remain future additions.
- Every MFD 3 command requires exactly one supported modifier.
- Option 3 is intentional: BTN7/S3 may remain assigned to aircraft controls. A modifier press can therefore also invoke NWS, A/R disconnect, missile step, or another aircraft-specific action.
- No aircraft-specific profile is installed or changed.
- Git tags in the form `vMAJOR.MINOR.PATCH` are the authoritative release versions.

## Install

Download `Scott-DCS-UI-Layer-Complete-Package-<version>.zip`, extract it, and add the ZIP inside its `OVGME` folder to an OvGME configuration rooted at your active DCS Saved Games directory.

See [Installation](docs/INSTALLATION.md), [Control mappings](docs/CONTROL-MAPPINGS.md), [Modifier variants](docs/MODIFIER-VARIANTS.md), and [OpenKneeboard](docs/OPENKNEEBOARD.md).

## Shared kneeboard pipeline

One script builds the page: `scripts/build-kneeboard.mjs`.

It maps labels from `config/reserved-inputs.json` onto the canonical Thrustmaster MFD diagram from [DCS-Common](https://github.com/ScottyMac52/DCS-Common) (`shared-hardware-consumer.mjs`). DCS-Common is located via `DCS_COMMON_ROOT` or `.dcs-common`. There is no separate `apply-shared-hardware` step.

## Build and validate

Requirements: Node.js 22, PowerShell 7, and a DCS-Common checkout.

```powershell
npm ci
$env:DCS_COMMON_ROOT = 'C:\path\to\DCS-Common'
npm run build:kneeboard
npm test
./scripts/Build-OvGME.ps1 -Version 0.1.0
./scripts/Test-Package.ps1 -Version 0.1.0
./scripts/Build-Release.ps1 -Version 0.1.0
./scripts/Test-Package.ps1 -Version 0.1.0
```

`Test-Package.ps1` validates the OVGME package and, when the complete release ZIP is present, the complete release bundle. There is no `Test-Release.ps1`.

Ordinary CI uses versions such as `0.0.0-ci.42`; local builds default to `0.0.0-local`. The tagged release workflow calculates the next semantic version and publishes assets built from that exact commit.
