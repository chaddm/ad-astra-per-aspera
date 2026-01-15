---
name: list-s3-buckets
description:
  List all S3 buckets in your AWS account using aws s3api with results returned
  in TOON format for efficient token usage.
license: MIT
compatibility: opencode
metadata:
---

# List S3 Buckets

## What I Do

This skill provides a script to list all S3 buckets in your AWS account using the `aws s3api list-buckets` command. Results are returned in TOON format for efficient token usage.

### Configuration

AWS requires SSO authentication to access S3 buckets. If the `aws` command returns an error that no matching credentials were found or no access to resources, return the following:

```
Authentication Failure: AWS SSO has not been authenticated.
Please follow your AWS SSO login procedure and then try again.
```

### Workflow

**List All Buckets**:

Use the `list_buckets.sh` script to list all S3 buckets in your AWS account.

**Syntax:**

```bash
./.opencode/skill/list-s3-buckets/list_buckets.sh
```

**Output Format:**

Results are returned in TOON format:

```toon
owner: 57ae06d7ead4f18f57e77501d49ecb47bc9748b82b6fffddd23a7b2d3c504c73
buckets[60]{name,arn,creationDate}:
  aws-athena-java-search-output,arn:aws:s3:::aws-athena-java-search-output,2022-06-14T20:54:35+00:00
  aws-athena-query-results-782546223821-us-east-1,arn:aws:s3:::aws-athena-query-results-782546223821-us-east-1,2022-06-13T20:36:39+00:00
  aws-glue-assets-782546223821-us-east-1,arn:aws:s3:::aws-glue-assets-782546223821-us-east-1,2020-12-14T19:17:34+00:00
  ...
```

**Error Format:**

Errors are returned in TOON format:

```toon
Error:
  status: 255
  message: An error occurred (AccessDenied) when calling the ListBuckets operation: Access Denied
```

## When to Use Me

Use this skill when you need to:

- List all available S3 buckets in your AWS account
- Get bucket metadata including ARNs and creation dates
- Verify bucket existence or access permissions
