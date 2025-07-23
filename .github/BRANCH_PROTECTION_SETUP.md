# GitHub Branch Protection Setup Guide

This guide explains how to set up branch protection rules in GitHub to enforce the branch naming convention and permissions.

## Setting Up Branch Protection Rules

### Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Click on "Branches" in the left sidebar

### Step 2: Create Branch Protection Rules

#### Protection Rule 1: Feature Branches (Org Members Only)

- **Branch name pattern**: `feature/*`
- **Settings to enable**:
  - ✅ Restrict pushes that create matching branches
  - ✅ Restrict pushes that create matching files
  - Under "Restrict pushes that create matching branches":
    - Select "Restrict to organization members"

#### Protection Rule 2: Release Branches (Org Members Only)

- **Branch name pattern**: `release/*`
- **Settings to enable**:
  - ✅ Restrict pushes that create matching branches
  - ✅ Restrict pushes that create matching files
  - Under "Restrict pushes that create matching branches":
    - Select "Restrict to organization members"

#### Protection Rule 3: Chore Branches (Org Members Only)

- **Branch name pattern**: `chore/*`
- **Settings to enable**:
  - ✅ Restrict pushes that create matching branches
  - ✅ Restrict pushes that create matching files
  - Under "Restrict pushes that create matching branches":
    - Select "Restrict to organization members"

#### Protection Rule 4: Hotfix Branches (Org Members Only)

- **Branch name pattern**: `hotfix/*`
- **Settings to enable**:
  - ✅ Restrict pushes that create matching branches
  - ✅ Restrict pushes that create matching files
  - Under "Restrict pushes that create matching branches":
    - Select "Restrict to organization members"

#### Protection Rule 5: Main Branch Protection

- **Branch name pattern**: `main`
- **Settings to enable**:
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass before merging
    - Add "Branch Name Validation" and "Branch Permission Check" as required checks
  - ✅ Require branches to be up to date before merging
  - ✅ Require conversation resolution before merging
  - ✅ Restrict pushes that create matching files

## Alternative: GitHub Enterprise Features

If you have GitHub Enterprise, you can also use:

1. **Repository Rules** (newer feature):

   - Go to Settings > Rules > Rulesets
   - Create rulesets for different branch patterns
   - More granular control over permissions

2. **Organization-level Rules**:
   - Set organization-wide policies
   - Apply rules across multiple repositories

## Verification

After setting up the rules:

1. Test with an organization member account - should be able to create `feature/test`, `release/test`, `chore/test`, and `hotfix/test` branches
2. Test with an external account - should be blocked from creating `feature/*`, `release/*`, `chore/*`, and `hotfix/*` branches
3. Verify that the GitHub Actions workflows run correctly on PRs

## Notes

- The GitHub Actions workflows provide immediate feedback to contributors
- Branch protection rules provide server-side enforcement
- External contributors will see clear error messages explaining which branch patterns they can use
- Organization members have full access to all branch patterns

## Troubleshooting

If external contributors report issues:

1. Check if they're using the correct branch prefixes (`fix/`, `docs/`, `community/`)
2. Verify the GitHub Actions workflows are enabled
3. Ensure branch protection rules are correctly configured
4. Check organization membership settings are properly configured
