# Project workflow

- After each significant, coherent change, run checks appropriate to the change and create a Git commit with a clear message describing the result.
- Review the staged diff before committing. Preserve unrelated user changes and never commit secrets, local environment files, dependencies, or generated build output.
- Keep `.env.example` and `package-lock.json` tracked so the project can be set up reproducibly.
- Do not push to a remote unless the user requests it.

## Git on this Windows workspace

If `git` is unavailable on PATH, use the workspace-local portable executable at `D:/Nhut Wedding/.tools/mingit/cmd/git.exe`.
