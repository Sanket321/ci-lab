# CI Lab: Your First CI Pipeline

A hands-on lab for Week 2 of the CI/CD learning path. In about 60 to 90 minutes you will:

- Run a small web app and its tests on your own computer
- Put it on GitHub and watch a pipeline build and test it automatically
- Break the code on purpose and see the pipeline catch it
- Fix it and watch the pipeline turn green again
- Lock the `main` branch so broken code can never be merged
- Download the packaged build artifact

You do not need to know much Node.js. The app is tiny and has **no external libraries**, so there is nothing complicated to install.

---

## What is inside

```
ci-lab/
├── src/
│   ├── app.js          The app: a greeting function and a small web server
│   └── server.js       Starts the server
├── test/
│   └── app.test.js     8 automatic tests (unit tests and server tests)
├── .github/workflows/
│   └── ci.yml          THE PIPELINE. This is the file to study.
├── package.json        Project info and the commands: build, test, start
├── package-lock.json   Exact versions, so every run is identical
└── .gitignore          Files Git should not track
```

The app has two endpoints:

| Request | Answer |
|---|---|
| `GET /health` | `{"status":"ok"}` |
| `GET /greet?name=Sam` | `{"message":"Hello, Sam!"}` |

---

## Before you start

You need:

1. A free **GitHub account**
2. **Git** installed (`git --version` should print a version)
3. **Node.js 20 or newer** (`node --version`). Only needed to run things on your own computer. The pipeline installs its own Node.

---

## Step 1: Run it on your own computer

Open a terminal in the `ci-lab` folder.

```bash
npm run build    # checks the code has no syntax errors
npm test         # runs the 8 tests
npm start        # starts the app on port 3000
```

With `npm start` running, open <http://localhost:3000/greet?name=Sam> in a browser. You should see a greeting. Stop the app with `Ctrl+C`.

**Why this matters:** the pipeline will run the same commands (`npm run build` and `npm test`). If they pass on your computer, they should pass in the pipeline. A pipeline is mostly your own commands, run automatically on a clean machine.

---

## Step 2: Put the project on GitHub

1. On GitHub, click **New repository**. Name it `ci-lab`. Leave it empty (no README, no .gitignore). Public repositories get free pipeline minutes. Private ones also get a free monthly allowance.
2. In your terminal, inside the `ci-lab` folder:

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/ci-lab.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

> The `.github` folder starts with a dot, so it may be hidden in your file explorer. `git add .` still includes it.

---

## Step 3: Watch your first pipeline run

1. Open your repository on GitHub.
2. Click the **Actions** tab.
3. You will see a run called **CI**. Click it.

You will see three jobs:

- **Build and test (Node 20)**
- **Build and test (Node 22)**
- **Package the app**

The two test jobs run **at the same time** (this is called a *matrix*). The package job waits for both to pass (`needs: test`). Click any job to see the live log of each step.

Wait for the green ticks. **You have a working CI pipeline.**

---

## Step 4: Break it on purpose

This is the most important exercise. A pipeline proves its value when it catches a mistake.

```bash
git switch -c break-the-build
```

Open `src/app.js` and find this line in the `greet` function:

```js
return `Hello, ${clean}!`;
```

Change it to:

```js
return `Hi, ${clean}!`;
```

Save, then:

```bash
git commit -am "Change greeting"
git push -u origin break-the-build
```

On GitHub, click **Compare & pull request**, then **Create pull request**.

Within a minute or two, the pull request shows a red cross and the message that checks failed. Click **Details** next to a failed check, open the **Run tests** step, and read which tests failed and why. (You should see 3 failures: the greeting expected "Hello" but got "Hi".)

**What you just saw:** a mistake was found by a machine, in minutes, before it reached the main code.

---

## Step 5: Fix it

Two valid fixes. Try both in different runs if you like:

- **The code was wrong:** change `Hi` back to `Hello`.
- **The requirement changed:** keep `Hi` and update the three tests in `test/app.test.js` to expect `Hi`.

Then:

```bash
git commit -am "Fix greeting"
git push
```

The pull request re-runs the pipeline automatically. Wait for the green ticks.

---

## Step 6: Protect the main branch

Right now nothing stops someone from merging a red pull request. Let's fix that.

1. In your repository, go to **Settings → Rules → Rulesets** and choose **New ruleset → New branch ruleset**. (Older GitHub screens call this **Settings → Branches → Add branch protection rule**.)
2. Name it `protect-main`. Set enforcement to **Active**.
3. Under **Target branches**, add the default branch (`main`).
4. Turn on **Require a pull request before merging**.
5. Turn on **Require status checks to pass**, then add these checks:
   - `Build and test (Node 20)`
   - `Build and test (Node 22)`
   - `Package the app`
6. Save.

> A check only appears in the search box after it has run at least once. You did that in Step 3.

**Test it:** open a new pull request with a deliberate break. The **Merge** button should be blocked until the checks pass.

This is a **gate**. In a company, this is how "the main branch is always releasable" is enforced by rules, not by hope.

---

## Step 7: Download the build artifact

1. Go to **Actions**, open a run on `main` that passed.
2. Scroll to **Artifacts** at the bottom of the page.
3. Download `ci-lab-package-<commit id>`.

This is the "build once" idea: one packaged result, named after the exact commit that produced it. Later, the same file would be deployed to Dev, UAT and Prod.

---

## How to read the pipeline file

Open `.github/workflows/ci.yml`. Each part maps to an idea from the learning notes:

| In the file | Meaning |
|---|---|
| `on: pull_request / push` | **Triggers.** When the pipeline starts |
| `concurrency` | Cancels outdated runs to save time |
| `permissions: contents: read` | **Least privilege.** The pipeline can only read code |
| `jobs:` | The stages, each on a fresh machine |
| `strategy.matrix` | Run the same job on several versions in parallel |
| `actions/checkout` | Download the code |
| `actions/setup-node` with `cache: npm` | Install Node, reuse downloads (**caching**) |
| `npm ci` | Install the exact locked versions (repeatable builds) |
| `npm run build`, `npm test` | The actual **build** and **test** stages |
| `needs: test` | A **gate**: packaging only happens if tests passed |
| `npm pack` + `upload-artifact` | Create and store the **artifact** |
| `timeout-minutes` | Stops a stuck job from burning minutes |

---

## Exercises (do these to really learn)

**Easy**
1. Add a new test for `greet('Ana')` and push it. Watch the test count go up.
2. Add Node 24 to the matrix: `node-version: [20, 22, 24]`.
3. Change the artifact `retention-days` to 3.

**Medium**
4. Add a new endpoint `GET /version` that returns the version from `package.json`. Write a test first, watch it fail, then make it pass. (This is test-driven development.)
5. Add a step that prints the Node version: `run: node --version`. Find it in the logs.
6. Make the pipeline run only when code changes, not for README edits. Look up `paths-ignore` under `on:`.

**Stretch**
7. Add a linter (ESLint) as a new job that runs in parallel with the tests.
8. Add the `actions/dependency-review-action` step to a pull request to scan dependencies (a first taste of DevSecOps).
9. Turn the `test` job into a reusable workflow (`workflow_call`) that another repository could call. This is the idea behind "golden pipelines".

---

## Troubleshooting

| Problem | What to try |
|---|---|
| No **Actions** tab or no run appears | Check the file path is exactly `.github/workflows/ci.yml`. Check Actions are enabled in **Settings → Actions → General**. |
| `npm ci` fails | `package-lock.json` must be committed. Run `npm install` locally and commit the lock file. |
| A required check never starts in the ruleset | The check name must match exactly, including the Node version in brackets. |
| Tests pass on your machine but fail in the pipeline | Compare Node versions. Look at the log of the failed step first. |
| `git push` asks for a password | GitHub no longer accepts account passwords. Use the GitHub CLI (`gh auth login`) or a personal access token. |

---

## What you learned (and where it goes next)

- **CI** means every change is built and tested automatically, with fast feedback.
- **A pipeline is code**, kept in the repo and reviewed like any other code.
- **Gates** (required checks) stop broken code from reaching `main`.
- **Artifacts** are built once and stored, ready to be deployed.

**Next, Week 3:** package this app in a Docker container, push the image to a registry, and add that as a new pipeline stage.
