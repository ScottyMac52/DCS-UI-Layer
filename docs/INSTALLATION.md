# Installation

## OvGME

1. Back up the active `Saved Games\DCS.openbeta\Config\Input\UiLayer` directory.
2. Close DCS.
3. Configure OvGME with the active DCS Saved Games root, normally `C:\Users\vyper\Saved Games\DCS.openbeta`.
4. Put `Scott-DCS-UI-Layer-Control-Profiles-<version>.zip` in that OvGME configuration's mod repository.
5. Enable the package.
6. Start DCS and open Options → Controls → UI Layer.
7. Confirm that MFD 3 shows the ten mappings and that both supported modifiers appear in the Modifiers dialog.
8. Add `KNEEBOARD\UiLayer` as an OpenKneeboard Folder tab.

The package replaces `Config\Input\UiLayer\modifiers.lua`. The current source preserves DCS's standard keyboard modifiers plus Scott's supported joystick modifiers. Back up this file before installation if other custom UI Layer modifiers have been added locally.

## Smoke test

Test in at least two airframes:

1. Hold VKB BTN7 or AVA F-16-grip S3.
2. Confirm each MFD 3 command matches the mapping page.
3. Confirm unmodified MFD 3 buttons continue to perform only their aircraft-specific actions.
4. Confirm the chosen modifier's aircraft command can still fire. This simultaneous behavior is intentional under Option 3.
5. Test VR hand toggles only while VR controllers are active.
6. Confirm Pause, Active Pause, and time controls in a single-player mission; multiplayer/server restrictions may block them.

## Removal

Close DCS and disable the component in OvGME. Restore the backup only if the local UI Layer was changed after enabling the package.

