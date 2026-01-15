#!/usr/bin/env bash
#
# list_buckets.sh - List all S3 buckets in the AWS account
#
# This script uses the 'pna' AWS profile to list all S3 buckets.
# Returns results in TOON format.

set -euo pipefail

# Use the pna profile
AWS_PROFILE="pna"

# Execute the AWS S3 list-buckets command and capture output and exit code
set +e
AWS_OUTPUT=$(aws s3api list-buckets --profile "${AWS_PROFILE}" --output json 2>&1)
AWS_EXIT_CODE=$?
set -e

# Check for errors
if [ $AWS_EXIT_CODE -ne 0 ]; then
    echo "Error:"
    echo "  status: $AWS_EXIT_CODE"
    # Escape and format the error message
    ERROR_MSG=$(echo "$AWS_OUTPUT" | tr '\n' ' ' | sed 's/"/\\"/g')
    echo "  message: $ERROR_MSG"
    exit $AWS_EXIT_CODE
fi

# Parse JSON output using jq (or fallback method if jq not available)
if command -v jq &> /dev/null; then
    # Use jq for robust JSON parsing
    OWNER=$(echo "$AWS_OUTPUT" | jq -r '.Owner.ID // "unknown"')
    
    # Parse buckets into array
    BUCKETS=()
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            BUCKETS+=("$line")
        fi
    done < <(echo "$AWS_OUTPUT" | jq -r '.Buckets[] | "\(.Name)|\(.Name)|\(.CreationDate)"')
    
else
    # Fallback: use grep/sed/awk for parsing (less robust)
    OWNER=$(echo "$AWS_OUTPUT" | grep -o '"ID"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"ID"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    
    # Extract bucket information
    BUCKETS=()
    while IFS= read -r name; do
        creation=$(echo "$AWS_OUTPUT" | grep -A1 "\"Name\"[[:space:]]*:[[:space:]]*\"$name\"" | grep "CreationDate" | sed 's/.*"CreationDate"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        if [ -n "$name" ] && [ -n "$creation" ]; then
            BUCKETS+=("${name}|${name}|${creation}")
        fi
    done < <(echo "$AWS_OUTPUT" | grep -o '"Name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"Name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# Count buckets
BUCKET_COUNT=${#BUCKETS[@]}

# Output in TOON format
echo "owner: ${OWNER}"
echo "buckets[${BUCKET_COUNT}]{name,arn,creationDate}:"

# Output each bucket
for bucket_line in "${BUCKETS[@]}"; do
    # Split on pipe delimiter
    IFS='|' read -r name bucket_name creation <<< "$bucket_line"
    
    # Build ARN
    ARN="arn:aws:s3:::${bucket_name}"
    
    # Escape commas in name if present
    NAME_ESCAPED=$(echo "$name" | sed 's/,/\\,/g')
    
    echo "  ${NAME_ESCAPED},${ARN},${creation}"
done
