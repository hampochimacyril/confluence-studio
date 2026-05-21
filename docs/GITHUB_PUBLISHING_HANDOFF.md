# GitHub Publishing Handoff

This document records the current publication state for Confluence Studio and
the safest way to finish the open-source requirement.

## Current Goal

Publish the complete Confluence Studio project to:

```text
https://github.com/hampochimacyril/confluence-studio
```

The repository is public and exists under the GitHub account
`hampochimacyril`.

## Current Local Repository State

Local folder:

```text
/Users/cch322/Library/CloudStorage/OneDrive-DrexelUniversity/PhD files/PhD_Simulation/PhD Dissertation Framework/HackSimBuild2026/confluence-studio
```

Branch:

```text
main
```

Remote:

```text
origin  https://github.com/hampochimacyril/confluence-studio.git
```

Latest local commits:

```text
acf3a7c Add public repository links
fd8cac4 Merge GitHub initial repository
ccdf4aa Prepare Confluence Studio open source scaffold
1085a80 Initial commit  (remote GitHub default README)
```

The local branch includes the GitHub initial commit and is ready to be pushed.
The remote repository currently has only the default one-line GitHub README.

## Why Local Push Failed

The local command:

```bash
git push -u origin main
```

failed because GitHub no longer accepts normal account passwords for HTTPS Git
pushes. The terminal asked for:

```text
Username for 'https://github.com':
Password for 'https://hampochimacyril@github.com':
```

At the password prompt, GitHub expects a Personal Access Token (PAT), not the
account password.

## Security Note

A GitHub token was accidentally pasted into the terminal/chat while debugging.
Treat that token as compromised.

Required action:

1. Go to `https://github.com/settings/tokens`.
2. Revoke the exposed token.
3. Do not save or paste any token into this repository.
4. If another token is needed, create a short-lived token and paste it only at
   Git's password prompt.

## Preferred Finish Path

Because GitHub is integrated with Claude, the fastest route is to ask Claude to
publish this local folder to the existing GitHub repository using its GitHub
integration. Use the prompt in:

```text
prompts/COWORK_GITHUB_PUBLISH_PROMPT.md
```

## Manual Finish Path If Needed

If using local terminal auth:

1. Revoke the exposed token.
2. Generate a new short-lived classic PAT with `repo` scope.
3. Run:

```bash
cd "/Users/cch322/Library/CloudStorage/OneDrive-DrexelUniversity/PhD files/PhD_Simulation/PhD Dissertation Framework/HackSimBuild2026/confluence-studio"
git push -u origin main
```

4. At the username prompt, enter:

```text
hampochimacyril
```

5. At the password prompt, paste the new PAT. The terminal will not show the
   token while pasting. Press Enter once.

6. After the push succeeds, revoke the token if it was created only for this
   upload.

## Files That Must Appear On GitHub

The published repository should contain:

```text
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/workflows/static-check.yml
.gitignore
CODE_OF_CONDUCT.md
CONTRIBUTING.md
Confluence_Session_Plan_v3.md
LICENSE
README.md
app/app.js
app/index.html
app/styles.css
docs/FUNCTIONAL_SPEC.md
docs/GITHUB_PUBLISHING_HANDOFF.md
docs/OPEN_SOURCE_READINESS.md
examples/scenarios.json
prompts/COWORK_GITHUB_PUBLISH_PROMPT.md
```

## Verification After Publishing

After publishing, confirm:

1. GitHub URL opens:

```text
https://github.com/hampochimacyril/confluence-studio
```

2. README is the full Confluence Studio README, not just:

```text
# confluence-studio
```

3. The repo shows MIT license, contribution guide, code of conduct, docs, app,
   examples, issue templates, and GitHub Actions workflow.

4. The static check workflow appears under the Actions tab.

5. Judges can run the app by opening:

```text
app/index.html
```

