# Control mappings

Every command below is present twice in the MFD 3 profile: once for `VKB_F14_BTN7` and once for `AVA_F16_S3`. Hold either modifier while pressing the listed MFD 3 control.

| MFD 3 input | UI Layer command | Category |
|---|---|---|
| `JOY_BTN1` | toggle VR Zoom | VR |
| `JOY_BTN2` | toggle VR Spyglass Zoom | VR |
| `JOY_BTN3` | Active Pause | General |
| `JOY_BTN13` | Time normal | General |
| `JOY_BTN18` | Pause | General |
| `JOY_BTN21` | VR, right hand (enable/disable) | VR |
| `JOY_BTN24` | recenter VR Headset | VR |
| `JOY_BTN25` | Time accelerate | General |
| `JOY_BTN26` | Time decelerate | General |
| `JOY_BTN27` | VR, left hand (enable/disable) | VR |

These button numbers, command identifiers, names, and press/release semantics come from Scott's DCS export. No F10 or Kneeboard-category command was present in that export, so neither is invented in this release.

## Intentional modifier reuse

Scott selected Option 3. The physical modifier buttons remain available to aircraft profiles:

- VKB F-14 BTN7 may continue to operate the F-14 NWS toggle.
- AVA F-16-grip S3 may continue to operate NWS/A-R disconnect/missile-step or another aircraft command.

Pressing a modifier can therefore invoke its aircraft command before or while the MFD 3 UI Layer chord is used. This is an accepted operational tradeoff, not a validation failure. Avoid using a UI Layer chord when an unintended aircraft-side action would be hazardous.

