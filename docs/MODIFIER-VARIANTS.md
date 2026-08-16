# Modifier variants

## Semantic modifier

All supported physical activators belong to the explicit `grip-shift` semantic modifier. This equivalence is configuration-scoped; `JOY_BTN3` and `JOY_BTN7` are never globally interchangeable.

| Modifier name | Grip family | Physical control | DCS device identity |
|---|---|---|---|
| `MOZA_F16_F18_BTN3` | F-16C / F/A-18C | BTN3 | `MOZA AB9 FFB Base {71DA6210-432E-11f1-8001-444553540000}` |
| `VKB_F14_BTN7` | F-14 | BTN7 | ` VKBSim Gunfighter F14   {2D5CEC70-5189-11f1-8001-444553540000}` |

Both are momentary modifiers (`switch = false`). The MFD 3 profile contains one binding entry per physical activator for every command; the activators are alternatives, not a chord requiring both controls.

## Scaffolding contract

- Physical identity is the tuple `(device, key)`.
- Semantic identity is the separately configured `grip-shift` ID.
- The MOZA F-16C and F/A-18C grips share one BTN3 entity.
- The VKB F-14 Gunfighter remains separate and joins the same semantic layer through BTN7.
- An unpaired binding remains present and is reported as a coverage difference.
- Output order is based on stable semantic and physical identifiers, not input file order.
