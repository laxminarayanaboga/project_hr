#!/bin/bash
set -e
REPO="laxminarayanaboga/project_hr"

TESTING_APPEND='

---

## Testing Requirements
> **Definition of Done: this story is not complete until all tests below are written and passing.**

### Unit Tests
- [ ] Service layer: JUnit 5 + Mockito — happy path, edge cases, error paths
- [ ] Controller layer: MockMvc — all endpoints, auth enforcement, validation errors
- [ ] Repository: @DataJpaTest — custom queries and specifications only
- [ ] Frontend components: Vitest + React Testing Library — renders, user interactions, error states

### E2E Tests (added once the full stack runs locally via Docker Compose)
- [ ] Playwright API test — happy path + key error cases using `request` fixture (no browser)
- [ ] Playwright UI test — full user journey page automation (login → action → assert result)'

echo "Fetching all user-story issues..."
ISSUE_NUMBERS=$(gh issue list --repo "$REPO" --label "user-story" --limit 200 --json number --jq '.[].number')

COUNT=0
for NUM in $ISSUE_NUMBERS; do
  echo "Patching issue #$NUM..."
  CURRENT=$(gh issue view "$NUM" --repo "$REPO" --json body --jq '.body')
  NEW_BODY="${CURRENT}${TESTING_APPEND}"
  echo "$NEW_BODY" | gh issue edit "$NUM" --repo "$REPO" --body-file -
  COUNT=$((COUNT + 1))
done

echo "Done. Updated $COUNT user-story issues."
