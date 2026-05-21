# Cowork Prompt: Publish Confluence Studio To GitHub

Copy and paste this prompt into Claude or another coworking agent that has
working GitHub integration for the `hampochimacyril` account.

```text
You are acting as a senior developer and release manager.

Task:
Publish the complete Confluence Studio open-source project to the existing
public GitHub repository:

https://github.com/hampochimacyril/confluence-studio

Important:
- Do not ask me for or store any GitHub token.
- Do not use the previously exposed token. It should be treated as compromised.
- Use your integrated GitHub connector/authentication.
- Preserve or replace the default one-line GitHub README with the full project
  README from the local working folder.

Local project folder:

/Users/cch322/Library/CloudStorage/OneDrive-DrexelUniversity/PhD files/PhD_Simulation/PhD Dissertation Framework/HackSimBuild2026/confluence-studio

Current local git state:
- Branch: main
- Remote: https://github.com/hampochimacyril/confluence-studio.git
- Latest local commit: acf3a7c Add public repository links
- The remote currently only has GitHub's initial README commit.
- The local history already merged the GitHub initial commit, so a normal push
  of local main to origin/main should be a fast-forward.

Preferred execution:
1. Inspect the local folder.
2. Verify there are no secrets or GitHub tokens in the files.
3. Verify the app syntax:
   node --check app/app.js
4. Push local branch main to:
   https://github.com/hampochimacyril/confluence-studio.git
5. If direct git push is unavailable, use the GitHub API/connector to create or
   update the repository files listed below on the main branch.
6. After publishing, verify the GitHub README is the full Confluence Studio
   README, not the default "# confluence-studio" placeholder.
7. Report the final public repo URL and any remaining issues.

Files that must be present on GitHub:

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

Project summary for commit message:

Confluence Studio is a static browser app for HackSimBuild 2026. It compares a
Houston mid-rise multifamily baseline municipal-water system against rainwater
harvesting and greywater reuse. It includes a dashboard, water-flow diagram,
flood-resilience module, editable assumptions, functional documentation, MIT
license, contribution guide, code of conduct, issue templates, example
scenarios, and a GitHub Actions static check.

Suggested commit message:

Publish Confluence Studio open-source scaffold

Verification checklist:
- README renders with project description and quick start.
- LICENSE is MIT.
- app/index.html, app/styles.css, and app/app.js are present.
- docs/FUNCTIONAL_SPEC.md is present.
- docs/OPEN_SOURCE_READINESS.md is present.
- docs/GITHUB_PUBLISHING_HANDOFF.md is present.
- .github/workflows/static-check.yml is present.
- examples/scenarios.json is present.
- No token or password is committed.
```

