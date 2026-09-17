# Badge 1 Git check repository template

Create one public template repository in the FRC 4451 organization from this file. Suggested name: `badge-1-git-check`.

## Student task

The repository contains `robot-checklist.md` with one incomplete checklist:

```markdown
# Robot startup checklist

- [ ] Battery secured
- [ ] Main breaker accessible
- [ ] Driver Station connected
- [ ] Robot disabled before entering the field
```

The student must add one line explaining who stays at Driver Station **Disable** during the first hardware test. They work on a branch, commit the change, push it, and open a pull request against `main`.

## Mentor review

Leave this review comment on the pull request:

> Make the new line an action that names the responsible person and when they must be ready to disable.

The student addresses the comment with a second commit on the same branch and requests review again. Merge only after the sentence is specific and the branch contains both commits.

## Repository settings

- Make the repository a template.
- Protect `main` from direct pushes.
- Require one approving review before merge.
- Allow Automation Team mentors to review and merge.
- Reset the exercise branch after each student; do not reuse a student's branch for another student.

## Badge evidence

Record the merged pull-request URL on the student's private badge record. The public pull request proves the branch, initial commit, review response, follow-up commit, and merge without collecting additional screenshots.
