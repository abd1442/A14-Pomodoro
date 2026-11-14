# A14 Pomodoro — Beta 5

**Windows x64 · 0.1.6-beta.5 · Unsigned prerelease**

## Changes

- T3-inspired White and Black & White themes are the defaults for new profiles, following Windows. Existing saved themes remain selected and the full palette library stays available.
- Saving the daily check-in removes it completely from Home. Answers stay saved, and the check-in stays hidden after navigation or reload.
- Compact dropdowns use the app theme rather than a Windows blue menu. Home sorting has short labels, a single border and a popup that stays within the subjects column.
- A theme-matched Windows header replaces the gray system caption strip. It stays visually consistent when the app loses focus and retains native minimize, maximize, close and snap behavior.

## Downloads

- [Windows x64 installer](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.5/A14-Pomodoro-0.1.6-beta.5-setup.exe)
- [Matching source and dependency materials](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.5/A14-Pomodoro-Beta-5-Source.zip)
- [Licenses and notices](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.5/A14-Pomodoro-Beta-5-Notices.zip)
- [Checksums](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.5/SHA256SUMS.txt) · [Release manifest](https://github.com/abd1442/A14-Pomodoro/releases/download/v0.1.6-beta.5/RELEASE-MANIFEST.json)

## Updating

Back up records in Settings and quit the old app completely, including its tray icon, before running Setup. Keep the existing installation scope and destination. Existing profiles, databases and backup formats are preserved. Existing users can choose White and Black & White under Settings → Appearance.

## Verification and limits

Passed: **1,223 tests in 91 files**, both TypeScript checks, production build, exact matching-source rebuild of 15 compiled files, all 119 extracted installer payload files and production security fuse checks. Isolated app checks covered themes, check-in persistence, compact dropdown sizing/keyboard selection and header focus/scale behavior. Source-copy coverage has no missing static keys across the seven languages; this is not independent linguistic certification.

The title bar was inspected in a native focused window, and its unchanged colors were verified with the renderer unfocused. Full native focus/blur visual inspection could not be completed after the native inspection helper disconnected. Actual clean-install/upgrade/uninstall lifecycle, physical accessibility and hardware endurance are not certified by these checks. The installer is unsigned.

This release updates Windows x64 only. Older tags and release assets remain unchanged. Original app code is GPL-3.0-only; supplied component licenses apply separately.
