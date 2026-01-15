---
name: list-objects-for-s3-bucket
description:
  List contents of a specific S3 bucket at a given path with pagination support.
  Results are returned in TOON format for efficient token usage.
license: MIT
compatibility: opencode
metadata:
---

# List Objects for S3 Bucket

## What I Do

This skill provides a script to list contents of a specific S3 bucket at a given path with pagination support. Results are returned in TOON format for efficient token usage.

### Configuration

AWS requires SSO authentication to access S3 buckets. If the `aws` command returns an error that no matching credentials were found or no access to resources, return the following:

```
Authentication Failure: AWS SSO has not been authenticated.
Please follow your AWS SSO login procedure and then try again.
```

### Workflow

**List Bucket Contents**:

Use the `list_objects_for_bucket.sh` script to list contents of a specific S3 bucket at a given path with pagination support.

**Syntax:**

```bash
./.opencode/skill/list-objects-for-s3-bucket/list_objects_for_bucket.sh <bucket-name> [path] [--page N] [--per N]
```

**Parameters:**

- `bucket-name`: Required. Name of the S3 bucket
- `path`: Optional. Path prefix within the bucket. If omitted, lists only root-level objects (non-recursive). If provided, lists all objects under that path recursively.
- `--page`: Optional. Page number (default: 1)
- `--per`: Optional. Items per page (default: 50)

**Output Format:**

Results are returned in TOON format:

```toon
pagination:
  page: 1
  per: 50
  showing: 1-6
objects[6]{key,size,date,time}:
  files/,0,2019-01-25,11:09:34
  files/data.tgz,673361221,2019-01-25,11:09:58
  files/history/,0,2019-02-24,20:26:00
  ...
```

**Error Format:**

Errors are returned in TOON format:

```toon
Error:
  status: 254
  message: An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist
```

**Examples:**

```bash
# List root-level objects in a bucket (first 50, non-recursive)
./.opencode/skill/list-objects-for-s3-bucket/list_objects_for_bucket.sh nexus-import

# List objects at a specific path (recursive)
./.opencode/skill/list-objects-for-s3-bucket/list_objects_for_bucket.sh nexus-import projects/2024/

# List with custom pagination (page 2, 25 items per page)
./.opencode/skill/list-objects-for-s3-bucket/list_objects_for_bucket.sh nexus-import --page 2 --per 25

# List specific path with pagination (recursive)
./.opencode/skill/list-objects-for-s3-bucket/list_objects_for_bucket.sh nexus-import projects/2024/ --page 1 --per 100
```

**Notes:**

- When no path is provided, the script lists only root-level objects (non-recursive). When a path is provided, it fetches ALL objects recursively from that path, then paginates locally
- For buckets with millions of objects, the initial fetch may take time when using a path prefix
- The `showing` field indicates the range of results displayed (e.g., "1-50" means items 1 through 50)
- When requesting pages beyond available results, `objects[0]` will be returned

## When to Use Me

Use this skill when you need to:

- Browse the contents of a specific S3 bucket
- Find files at a specific path within a bucket
- List objects with pagination for large buckets
- Get object metadata including size and timestamps
