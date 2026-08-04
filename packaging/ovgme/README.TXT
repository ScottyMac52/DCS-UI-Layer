Scott DCS UI Layer Control Profiles {{VERSION}}

This OvGME component installs Scott's global DCS UI Layer MFD 3 profile,
modifier definitions, and a globally available DCS kneeboard reference page.

Configure OvGME at the active DCS Saved Games root, close DCS, and enable
the package. The page is installed directly under KNEEBOARD so it appears
in every aircraft's standard DCS kneeboard.

WARNING: Option 3 intentionally reuses VKB BTN7 and AVA F-16-grip S3 as
both UI Layer modifiers and aircraft controls. A modifier press can also
invoke NWS, A/R disconnect, missile step, or another aircraft command.

Back up Config\Input\UiLayer before enabling. This package replaces
UiLayer\modifiers.lua.
