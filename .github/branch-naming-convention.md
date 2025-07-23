# Branch Naming Convention

## For CometChat Team Members

- `feature/feature-name` - New product features or major enhancements
- `docs/section-name` - Documentation for new features or major updates
- `release/version-number` - Release preparation branches
- `chore/task-description` - Maintenance tasks, dependency updates
- `hotfix/issue-description` - Critical fixes for production issues

## For Community Contributors

- `fix/description` - Bug fixes, typo corrections, broken links, or small corrections
- `docs/improvement-description` - Documentation improvements or clarifications
- `community/contribution-description` - General community contributions, examples, guides

## Examples

- `feature/video-calling-v3` (Internal)
- `docs/react-ui-kit` (Internal)
- `release/v4.0.0` (Internal)
- `chore/update-dependencies` (Internal)
- `hotfix/fix-critical-auth-bug` (Internal)
- `fix/typo-in-getting-started` (Community)
- `docs/clarify-authentication-steps` (Community)
- `community/add-react-native-example` (Community)

## Branch Naming Rules

1. Use lowercase letters and hyphens (kebab-case)
2. Be descriptive but concise
3. Use the appropriate prefix based on your contribution type
4. Avoid special characters except hyphens

## Branch Permissions

- **Restricted to CometChat org members only**: `feature/*`, `release/*`, `chore/*`, `hotfix/*`
- **Available to all contributors**: `fix/*`, `docs/*`, `community/*`

## Enforcement

Branch names that don't follow this convention may be asked to be renamed before merging.
