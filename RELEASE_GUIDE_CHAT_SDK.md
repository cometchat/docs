# Release Guide — CometChat React Native SDK

## Version Bump Checklist

When preparing a new release, update the version in all of the following locations:

| # | File | Field | Format |
|---|------|-------|--------|
| 1 | `package.json` | `version` | `"X.Y.Z"` |
| 2 | `package-lock.json` | `version` (top-level + `packages[""]`) | `"X.Y.Z"` |
| 3 | `src/lib/Constants.ts` | `APPINFO.sdkVersion` | `"vX.Y.Z"` |
| 4 | `src/lib/Constants.ts` | `APPINFO.sdkVersionWithUnderScore` | `"X_Y_Z"` |
| 5 | `src/lib/Constants.ts` | `SDKHeader.sdkVersion` | `"X.Y.Z"` |

All five values must stay in sync. Mismatched versions will cause issues with API headers and session tracking.

## Build & Verify

```bash
# 1. Build the dist output
npm run build

# 2. Verify the version made it into the bundle
grep -o 'sdkVersion.*"[0-9]\+\.[0-9]\+\.[0-9]\+"' dist/CometChat.js

# 3. Check the type definitions reflect your changes
git diff origin/dev-v4 -- dist/CometChat.d.ts
```

## Release Steps

1. Create a release branch from `dev-v4`:
   ```bash
   git checkout -b release-YYYY-MM-week-N dev-v4
   ```

2. Make your changes (features, fixes, etc.).

3. Update the version in all four locations listed above.

4. Build and verify:
   ```bash
   npm run build
   ```

5. Commit and push:
   ```bash
   git add -A
   git commit -m "vX.Y.Z"
   git push origin release-YYYY-MM-week-N
   ```

6. Create a PR targeting `dev-v4` and get it reviewed. The merge commit message must be: `vX.Y.Z` only — no prefix, no description.

7. After `dev-v4` merge, create a PR from `dev-v4` → `master-v4` and get it reviewed. The merge commit message must be: `vX.Y.Z` only.

8. After `master-v4` merge, publish to npm via the public repo:

   **Private repo** = `cometchat-team/chat-sdk-react-native` (source code, not published directly)
   **Public repo** = `cometchat/chat-sdk-react-native` (published to npm)

   a. Clone the public repo (if not already cloned):
      ```bash
      git clone git@github.com:cometchat/chat-sdk-react-native.git ../chat-sdk-react-native-public
      ```

   b. Update the version in the public repo's `package.json`:
      ```bash
      sed -i '' 's/"version": "OLD_VERSION"/"version": "X.Y.Z"/' ../chat-sdk-react-native-public/package.json
      ```

   c. Copy the built files from the private repo's `dist/` to the public repo:
      ```bash
      cp dist/CometChat.js ../chat-sdk-react-native-public/CometChat.js
      cp dist/CometChat.d.ts ../chat-sdk-react-native-public/CometChat.d.ts
      ```

   d. Verify the changes:
      ```bash
      cat ../chat-sdk-react-native-public/package.json | grep version
      git -C ../chat-sdk-react-native-public diff --stat
      ```

   e. Commit and push in the public repo:
      ```bash
      cd ../chat-sdk-react-native-public
      git add -A
      git commit -m "vX.Y.Z"
      git push origin master
      ```

   f. Publish to npm from the public repo:
      ```bash
      npm publish --access public
      ```

## Branch Naming Convention

- Release branches: `release-YYYY-MM-week-N` (e.g., `release-2026-03-week-1`)
- Feature branches: `feature/<description>/<ticket-id>` (e.g., `feature/online-member/ENG-21269`)
- Bug fix branches: `<ticket-id>-fix` (e.g., `ENG-30169-fix`)

## Commit Message Format

- `feat: <description>` — New feature
- `fix: <description>` — Bug fix
- `chore: <description>` — Maintenance (version bumps, config changes)
- `feat(<scope>): <description>` — Scoped feature (e.g., `feat(notifications): ...`)
