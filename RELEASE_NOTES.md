# A14 Pomodoro — Beta 6

**Windows x64 · 0.1.6-beta.6 · Unsigned prerelease**

## Changes

- One Windows-style on/off switch across Settings, first run, Home timer options and Stats, with a clearly visible off state in light and dark themes.
- The A14 logo stays visible in the black-and-white themes: the title-bar, collapsed-sidebar and About icons turn light on black, and the countdown arc sits inside the tile.
- Appearance Undo is reliable: it appears after a theme change, preset, import or reset, lasts eight seconds and never reverts a later change.
- Settings search works fully from the keyboard, and Appearance shortcuts move focus to the chosen section.
- History on a new profile shows a single “Start studying” card that matches Stats, and swatches, focus outlines and secondary buttons are calmer and easier to read.

## Downloads

- [Windows x64 installer](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.6/A14-Pomodoro-0.1.6-beta.6-setup.exe)
- [Matching source and dependency materials](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.6/A14-Pomodoro-Beta-6-Source.zip)
- [Licenses and notices](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.6/A14-Pomodoro-Beta-6-Notices.zip)
- [Checksums](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.6/SHA256SUMS.txt) · [Release manifest](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.6/RELEASE-MANIFEST.json)

## Updating

Back up records in Settings and quit the old app completely, including its tray icon, before running Setup. Keep the existing installation scope and destination. Existing profiles, databases and backup formats are preserved. Existing users can choose White and Black & White under Settings → Appearance.

## Verification and limits

Passed: **1,223 tests**, both TypeScript checks, production build, all 119 extracted installer payload files and production security fuse checks. A fictional-profile QA build was captured across Home, Settings, Appearance, History, Stats, Library, Learn, the running timer and the floating panel in light and dark. Source-copy coverage has no missing static keys across the seven languages; this is not independent linguistic certification.

Actual clean-install/upgrade/uninstall lifecycle, physical accessibility and hardware endurance are not certified by these checks. The installer is unsigned.

This release updates Windows x64 only. Older tags and release assets remain unchanged. Original app code is GPL-3.0-only; supplied component licenses apply separately.
