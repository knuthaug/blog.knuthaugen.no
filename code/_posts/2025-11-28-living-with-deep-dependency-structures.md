---
layout: post
title: "Living With Deep Dependency Structures"
published: true
tags: []
category: code
---

At the time of writing this, we are in the aftermath of [Shai-hulud 2.0](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack)<sup><a href="#ref1">1</a></sup>, which came on the back of the two first rounds of attacks from the first version of Shai-hulud<sup><a href="#ref2">2</a></sup> <sup><a href="#ref3">3</a></sup>. Supply chain attacks is nothing new under the sun, and the JavaScript ecosystem is by no means the only one vulnerable to these kinds of attacks. But we do have some special circumstances that make life as JavaScript developer, well let's say _interesting_. 

When you combine the extreme multitude of JavaScript/node packages, the current state of JavaScript frameworks, developers prioritisation of developer experience over small codebases and shallow dependency structures and the relatively weak security history of npmjs.org with this old joke image

<img src="/assets/images/node-modules.jpg" class="full-bleed" alt="The weight of a node_modules directory outweighs a black hole joke image"/>

you have of course created en ecosystem ripe for exploitation. Which these recent supply chain attacks have shown, where attackers have managed to get face 2-factor codes via deftly created phishing emails (who thought developers fell for phishing, right?) and published _a lot_ packages with malicious code (a secret-stealing self-replicating worm) in a short time. Combine this again with `package.json` files with version ranges instead of pinned version numbers and obviously little focus on these matters, and you get a lot of infected repos. Despite the exploits having been quickly identified. We must as a profession aim to do better!

### The Low-hanging Fruit

I make no claim to have solved this issue once and for all. My team got a real eye opener on the first shai-hulud attack and implemented some organisational and technical changes that we think have helped. Stress was much lower this last round, but you're never really safe, are you? Some of these things apply to other parts of the project than just the JavaScript packages, but I think they're just as relevant. Some of these are also only possible in [pnpm](https://pnpm.io/) and I would highly suggest you upgrade (yes upgrade) if you're still using npm. Pnpm implemented their `minimumReleaseAge`<sup><a href="#ref4">4</a></sup> configuration setting just days after the first attack. It's also faster and has better dependency management than npm in general. Also it supports mono-repos out of the box. More on that later. 

First of all, your dependencies _are_ a part of your application, not some loose add-on you don't have to worry about. In fact, you should worry much more about the dependencies than your own code precisely because you haven't written it yourself. I realise this is something that will cost you a lot of time and effort, but you should consider doing things like 

1. Investigate and know who is behind the package. If you trust the publisher, you can put more trust in the package. But package publishers change over time. Do you keep track?

2. If you don't particularly trust the publisher, or can't find enough information, consider freezing the version you're using after looking over the code yourself. If future versions contain security fixes, you need to investigate again. 

3. Be prepared to take over the code yourself if the package changes hands, is no longer being maintained or simply disappears from npmjs.org.
{: class="numbers"}

All this means you should think twice (or three times) before taking on dependencies. The fewer dependencies you have, the less work you have to put into this. You of course have to implement more stuff yourself, but that is also code you own and control 100%. The bigger your dependency tree is, the more vulnerable to supply chain attacks are you. Consider using a tool like [syft](https://github.com/anchore/syft?tab=readme-ov-file#syft) for inspecting you dependency tree in full (it can also generate SBOMs for your project). Tools like [knip](https://knip.dev/) can analyse dependencies and find unused ones. 

Secondly, some low hanging fruits you absolutely should consider implementing: 

1. Use exact version numbers of most dependencies, if not all of them, and not ranges, carets and thilde-versions. 

2. Set `minimumReleaseAge` in your Renovate configuration (dependabot users, see `cooldown`<sup><a href="#ref5">5</a></sup>) to the recommended two week period, or thereabouts. We quickly found out that you can install packages not meeting this requirement locally, so we followed it with setting `minimumReleaseAge` also in pnpm, but a slightly shorter time. If not, you might get race condition-like problems with package install. 

3. Use the `best-practices` base configuration for renovate and extend it in a central location so all repos can use it. 

4. All actions used in build steps and CI should be pinned on a SHA1 hash for the version, not a version tag. So instead of `actions/checkout@v4` in an github action file, you specify `actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8`. The contents of the tag `v4` can change if someone gains access to the repo containing that code. Renovate handles updates of the sha when new versions are releases. Read more about github actions exploits [this blog post from Palo Alto Networks](https://www.paloaltonetworks.com/blog/prisma-cloud/github-actions-worm-dependencies/)

5. When the number of updates increase due to version pinning, consider using automerge on e.g. patch versions of dev dependencies. This can be done both with renovate or tools like bulldozer<sup><a href="#ref6">6</a></sup>. Take a good look at your test suite and ask yourself [do you have enough tests?](/misc/2024/10/20/how-much-is-just-enough.html). If the answer is no, consider writing some more tests before automerging anything. I would seriously discourage automerging without a cooldown/minimumReleaseAge setting.

6. Consider also to group dependencies (e.g. we group `@type` deps in one group, linting deps in another) into fewer PRs to get better overview.

7. Renovate can also be configured to have a different schedule for different packages. In general renovates config seem to be able to do everything imaginable, including running a small country. But the number of config options are staggering as a result. 

8. Make sure the build actions only have the access scope it needs, and not the default scope which, depending on github organisation configuration can be quite wide. 

9. While you're at it, pin your Docker base images, if you have any, to SHA1 versions also. Shit can happen there too. Shit can happen everywhere in your dependencies.

10. Make sure you're running `npm ci` or `pnpm i --frozen-lockfile` in CI, and not the normal commands that mutate the lockfile and might install other versions. 
{: class="numbers"}

One thing we have not implemented yet, but may be forced to investigate in the future is Software Bill of Materials (SBOM<sup><a href="#ref7">7</a></sup>). This can be a game changer security wise, but the organisational cost of implementing it is non-trivial. 

Third: I read about someone claiming they had seen, as a consultant, that teams were not committing their lock files to version control. If you should happen to be one of those, go and fix that immediately. The rest of this post can wait. Re-generating your lockfile on each install, bot locally and in CI is not the way to go. A supply chain attack disaster is waiting around the corner. 

The last tip is covered in the next section as it involves some configuration and examples. 

### OSV-scanner

We quickly found out that we needed a tool to scan our repositories for vulnerabilities in an organised way. We chose [OSV-scanner](https://github.com/google/osv-scanner) which supports a lot of different languages and modes, regular package system vulnerabilities, licenses, docker images etc. 

We liked the concept of a dependency dashboard that Renovate creates and created our own security dashboard (also an github issue, which is pinned) updated by a github action every night. 

Some github action code running the osv-scanner in a docker image, scanning the repo and outputting the results in a markdown file. This is in a shared action definitions usable across repositories.

```yaml
name: osv-scanner
description: Specialized reporting of scanner results for github actions

inputs:
  extra-scanner-args:
    description: Extra args to pass to osv-scanner
    required: false
  extra-body-file:
    description: Path to a markdown file to prepend to the issue body
    required: false
  github-token:
    description: GitHub token for creating/updating issues
    required: true

runs:
  using: composite
  steps:
    - name: Run OSV Scanner
      shell: bash
      # If the scanner reports vulnerabilities it will exit with a non-zero code
      # and we want to continue running the next step to create/update the issue
      continue-on-error: true
      run: |
        docker build -t osv-scanner-local ${% raw %}{{ github.action_path }}{% endraw %}/docker
        docker run --rm \
          -v "$PWD:/src" \
          -w /src \
          osv-scanner-local \
          scan ${% raw %}{{ inputs.extra-scanner-args }}{% endraw %} --recursive --output=osv-result.md --format=markdown ./

    - name: Create or update security dashboard
      shell: bash
      env:
        GH_TOKEN: ${% raw %}{{ inputs.github-token }}{% endraw %}
        EXTRA_BODY_FILE: ${% raw %}{{ inputs.extra-body-file }}{% endraw %}
      run: |
        node ${{ github.action_path }}/scripts/create-or-update-issue.ts
```
{: class="full-bleed"}

The script on the last line will then create or update an issue with the results. It looks like this:

```typescript
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { formatReport, readExtraBodyFile } from './utils.ts';

async function main() {
  const shouldExitEarly = !process.env.GITHUB_ACTIONS;
  if (shouldExitEarly) {
    console.log('This script is intended to run in GitHub Actions only.');
    process.exit(0);
  }

  // Parse scan results
  const scanResultPath = path.resolve(process.cwd(), 'osv-result.md');
  const scanResult = await fs.readFile(scanResultPath, 'utf-8');
  const formattedScanResult = formatReport(scanResult);

  const extraBody = await readExtraBodyFile(process.env.EXTRA_BODY_FILE);

  const issueFooter = `

> [!NOTE]
> This issue is automatically updated by a Github Action.
> The data is generated by [OSV.dev](https://osv.dev/)
`;

  const issueBody = `${extraBody}${formattedScanResult}${issueFooter}`;

  // Get Security Dashboard issue if it exists
  const issueListOutput = execSync(
    'gh issue list --author "[bot]" --state all --json title,number,body,state --jq \'[.[] | select(.title == "Security Dashboard")]\'',
    { encoding: 'utf-8' },
  );

  const issues = JSON.parse(issueListOutput);
  const issue = issues[0];

  const tmpFilename = '.issue-body-temp.md';
  await fs.writeFile(tmpFilename, issueBody);

  if (issue) {
    const issueNumber = issue.number;
    const state = issue.state;

    // Reopen if closed
    if (state !== 'OPEN') {
      console.log(`Issue is not open, reopening #${issueNumber}`);
      execSync(`gh issue reopen ${issueNumber}`);
    }

    // Update existing issue
    console.log(`Updating existing issue #${issueNumber}`);
    execSync(`gh issue edit ${issueNumber} --body-file ${tmpFilename}`);
  } else {
    // Create new issue
    console.log('Creating new issue');
    execSync(`gh issue create --title "Security Dashboard" --body-file ${tmpFilename}`);
  }
  await fs.unlink(tmpFilename);
}

main();

```
{: class="full-bleed"}

And the utils script for completeness:

```typescript
import path from 'node:path';
import fs from 'node:fs/promises';

// There is an issue in the markdown output from osv, where a line break is missing between the different tables,
// causing all tables to be merged into one.
export function formatReport(input: string): string {
  // Split the input into lines for processing
  const lines = input.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if current line starts with the target strings
    const isLicenseTable = line.trim().startsWith('| License |');
    const isLicenseViolationTable = line.trim().startsWith('| License Violation |');

    // If we found one of the target strings and it's not the first line,
    // add a newline before it (unless there's already an empty line before it)
    if ((isLicenseTable || isLicenseViolationTable) && i > 0) {
      const previousLine = result[result.length - 1];
      if (previousLine && previousLine.trim() !== '') {
        result.push(''); // Add empty line
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

export async function readExtraBodyFile(filePath: string | undefined) {
  if (!filePath) {
    return '';
  }

  if (!filePath.toLowerCase().endsWith('.md')) {
    console.log(`::warning::extra-body-file must be a .md file, got: ${filePath}`);
    return '';
  }

  if (!process.env.GITHUB_WORKSPACE) {
    console.log('::warning::GITHUB_WORKSPACE is not defined in the environment.');
    return '';
  }

  const absolutePath = path.resolve(filePath);
  const workspacePath = path.resolve(process.env.GITHUB_WORKSPACE);
  if (!absolutePath.startsWith(workspacePath + path.sep) && absolutePath !== workspacePath) {
    console.log(`::warning::extra-body-file must be within the repo, got: ${filePath} (resolved to ${absolutePath})`);
    return '';
  }

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    console.log(`Successfully read extra body content from ${filePath}`);
    return content + '\n\n';
  } catch (error) {
    console.log(`::warning::Failed to process extra-body-file: ${error}`);
  }
  return '';
}

```
{: class="full-bleed"}

This creates a fairly verbose security and license report on the state of the repository. 

<img src="/assets/images/security-dashboard.png" alt="Screenshot of a security dashboard issue created by the action" class="full-bleed">

We have discussed if we should run this on every branch too, but the jury is not in yet. With the mentioned configs for `minimumReleaseAge` we are unsure if it's needed. But it won't cost us much, as the shared action can be reused with a little modification to brake the branch build instead of updating the dashboard, and the scanner itself is very fast. 

### Monorepo FTW

<img src="/assets/images/monorepo.jpg" alt="Monorepo all the things meme image" class="full-bleed">

When implementing some of these settings per repo, we very quickly discovered that even with shared configuration and shared github actions making sure all repositories were safe took quite a bit of time. Due to historical reasons we have our main applications and support libraries for those in one monorepo, while other stuff is spread around in smaller repositories, some of which are smaller monorepos and some are single-library repos. This makes the job of keeping track of security and dependencies in all of them a challenge. What use is a security dashboard when you have 8 of them? So next on our list is to merge more of the smaller repos into bigger ones. Maybe not all in one, bur certainly fewer than today. Fewer places to keep track and fewer eyes needed for the job, which means more eyes for other tasks. 

### References

1. <a href="https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack" name="ref1">https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack</a>

2. <a href="https://www.aikido.dev/blog/npm-debug-and-chalk-packages-compromised" name="ref2">https://www.aikido.dev/blog/npm-debug-and-chalk-packages-compromised</a>

3. <a href="https://www.aikido.dev/blog/s1ngularity-nx-attackers-strike-again" name="ref3">https://www.aikido.dev/blog/s1ngularity-nx-attackers-strike-again</a>

4. <a href="https://pnpm.io/settings#minimumreleaseage" name="ref4">https://pnpm.io/settings#minimumreleaseage</a>

5. <a href="https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference?versionId=free-pro-team%40latest&productId=code-security&restPage=dependabot%2Cworking-with-dependabot%2Cdependabot-options-reference#cooldown-" name="ref5">https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference?versionId=free-pro-team%40latest&productId=code-security&restPage=dependabot%2Cworking-with-dependabot%2Cdependabot-options-reference#cooldown-</a>

6. <a href="https://github.com/palantir/bulldozer" name="ref6">https://github.com/palantir/bulldozer</a>

7. <a name="ref7" href="https://www.crowdstrike.com/en-us/cybersecurity-101/exposure-management/software-bill-of-materials-sbom/">https://www.crowdstrike.com/en-us/cybersecurity-101/exposure-management/software-bill-of-materials-sbom/</a>
{: class="numbers"}