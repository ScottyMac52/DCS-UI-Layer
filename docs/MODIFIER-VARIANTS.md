# Modifier variants

## Supported

| Modifier name | Physical control | DCS device identity |
|---|---|---|
| `VKB_F14_BTN7` | VKB F-14 Gunfighter BTN7 | ` VKBSim Gunfighter F14   {2D5CEC70-5189-11f1-8001-444553540000}` |
| `AVA_F16_S3` | AVA with F-16/Warthog grip S3 (`JOY_BTN3`) | `Ava [R] Viper {F77212B0-00A8-11f1-8001-444553540000}` |

Both are momentary modifiers (`switch = false`). The MFD 3 profile contains one binding entry per modifier for every command; the modifiers are alternatives, not a chord requiring both controls.

## Awaiting export

AVA with the F/A-18 grip is architecturally supported but cannot be activated safely until DCS supplies its exact device name, GUID, S3 HID button, and modifier serialization. Do not copy the F-16-grip identity: changing the grip can change the Windows/DCS device identity.

To add it:

1. Install the F/A-18 grip on the AVA base.
2. In UI Layer, add S3 as a momentary modifier with the name `AVA_F18_S3`.
3. Add one temporary MFD 3 binding using that modifier.
4. Export `UiLayer\modifiers.lua` and the MFD 3 `.diff.lua` profile.
5. Add the verified modifier definition and a third alternative entry to every mapped command.

Validation deliberately fails if `AVA_F18_S3` is marked supported without a concrete device identity and button.

