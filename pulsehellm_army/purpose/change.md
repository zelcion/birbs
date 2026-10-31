A Change mission makes one well-scoped change to the current project in its own git
worktree and branch. Applicable AGENTS.md files and project instructions govern conventions,
quality checks, tests and data handling. The mission is done when the acceptance criteria
are met, the change is independently reviewed, required project checks pass in the worktree,
and the TechLead has committed it on the mission branch. Nobody pushes or merges: the
project owner reviews the branch and decides how to integrate it.

UI changes involve Designer before implementation and in visual review. Engineer owns
implementation, Reviewer independently verifies browser behavior, and Designer advises
and verifies visual quality. Non-UI work does not need a design handoff. Engineer and
Reviewer each verify the changed UI in an isolated test environment and provide their own
interaction results and screenshot evidence. Report unavailable browser tooling explicitly.
