---
name: list-project-import-files
description:
  Find all Provider Nexus API project import files for a specific project number
  in the nexus-import S3 bucket. Results sorted by build ID in TOON format.
license: MIT
compatibility: opencode
metadata:
---

# List Project Import Files

## What I Do

This skill provides a script to find all Provider Nexus API project import files for a specific project number in the `nexus-import` S3 bucket. Results are sorted by build ID (execution ID) in descending order and returned in TOON format for efficient token usage.

### Configuration

AWS requires SSO authentication to access S3 buckets. If the `aws` command returns an error that no matching credentials were found or no access to resources, return the following:

```
Authentication Failure: AWS SSO has not been authenticated.
Please follow your AWS SSO login procedure and then try again.
```

### Workflow

**Find Project Files**:

Use the `list_pna_project_files.sh` script to find all project files for a specific project number in the `nexus-import` bucket. Results are sorted by build ID (execution ID) in descending order.

**Syntax:**

```bash
./.opencode/skill/list-project-import-files/list_pna_project_files.sh --project-number NNNNNNNN
```

**Parameters:**

- `--project-number`: Required. Eight-digit project number (leading zeros allowed)

**Output Format:**

Results are returned in TOON format:

```toon
bucket: nexus-import
projects[243]{name,size,date,time}:
  project/558718/20161220_35026_v6_diff.tgz,7407725716,2026-01-09,10:33:53
  project/558556/20161220_35010_v6_diff.tgz,6842735773,2026-01-07,22:29:26
  project/558222/20161220_34991_v6_diff.tgz,2409492656,2026-01-04,18:01:51
  ...
```

**Empty Results:**

When no files match the project number:

```toon
bucket: nexus-import
projects[0]{name,size,date,time}:
```

**Error Format:**

Errors are returned in TOON format:

```toon
Error:
  status: 1
  message: --project-number must be an 8-digit number (leading zeros allowed)
```

**Examples:**

```bash
# Find all files for project 20161220
./.opencode/skill/list-project-import-files/list_pna_project_files.sh --project-number 20161220

# Find files for project with leading zeros
./.opencode/skill/list-project-import-files/list_pna_project_files.sh --project-number 00012345
```

**Notes:**

- The script searches the `s3://nexus-import/project/` path
- Files match the pattern: `{execution_id}/{project_number}_{pgid}_v{version}_{full|diff}.tgz`
- Results are sorted by execution ID (build ID) in descending order (newest first)
- The project number must be exactly 8 digits (leading zeros are allowed and preserved)
- Common project numbers: 20161220, 20151124, 20201647, etc.

## When to Use Me

Use this skill when you need to:

- Find all import files for a specific Provider Nexus API project
- Get the latest project build files
- View project import history sorted by build ID
- Verify project file availability in the nexus-import bucket
