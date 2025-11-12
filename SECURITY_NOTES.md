Security notes (auto-generated)

During an initial inspection of the repository I discovered hard-coded secrets and sensitive OCI/Oracle connection strings in `docker-compose.oracle.yml` and other files. These are security risks and should be removed from the repository and rotated immediately.

Findings:
- `docker-compose.oracle.yml` contains a `DATABASE_URL` with username/password and a wallet password in the URL query.
- `docker-compose.oracle.yml` also includes OCI tenancy and compartment OCIDs and other production-like values.
- There may be an `oracle-wallet` directory and other sensitive files in the repo tree (check for `oracle-wallet/` or similar and remove from VCS).

Recommended immediate actions:
1. Replace secrets in tracked files with references to environment variables and store secrets only in `.env` (which must be in `.gitignore`) or in a secrets manager (OCI Vault, AWS Secrets Manager, GitHub Secrets).
2. Rotate any credentials that were committed to this repository.
3. Remove `oracle-wallet/` and any credential files from git history (use `git rm --cached` and consider using the BFG or git filter-repo to purge them from history).
4. Add `.env` to `.gitignore` and ensure the repo has `.env.example` (created alongside this file).
5. Limit permissions for OCI and DB users (use least privilege).

If you'd like, I can:
- Add `.gitignore` entries and automatically create a `.env` template (already added `.env.example`).
- Replace inline secrets in `docker-compose.oracle.yml` with env var placeholders and create an `.env.production` template.
- Provide commands to purge secrets from git history and rotate credentials.

