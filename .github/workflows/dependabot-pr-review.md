---
on: pull_request

description: "Workflow that analyzes Dependabot pull requests and provides feedback."

if: github.actor == 'dependabot[bot]'

---

This is a pull request created by Dependabot to update a dependency.
There are a few things you need do to help evaluate the update being proposed.

First, analyze all the different ways that the dependency is currently used within this repository.

After that, cross-reference this with an exhaustive list of changes included in the update and provide a detailed analysis, including a confidence rating of how likely the update is to cause problems in the repository.

And finally, the goal should always be to remove dependencies whenever possible. Provide a report summarizing whether it's reasonably possible to replace the dependency, what it would take, and the risk involved.  

Leave your findings in a comment on the pull request.
