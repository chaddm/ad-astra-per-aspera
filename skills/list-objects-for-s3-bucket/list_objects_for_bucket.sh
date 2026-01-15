#!/usr/bin/env bash
#
# list_objects_for_bucket.sh - List contents of an S3 bucket with pagination
#
# Usage: list_objects_for_bucket.sh <bucket-name> [path] [--page N] [--per N]
#
# This script uses the 'pna' AWS profile to list objects in a specific S3 bucket.
# Results are paginated and returned in TOON format.
#
# Parameters:
#   bucket-name  : Required. Name of the S3 bucket
#   path         : Optional. Path prefix within the bucket
#   --page       : Optional. Page number (default: 1)
#   --per        : Optional. Items per page (default: 50)

set -euo pipefail

# Use the pna profile
AWS_PROFILE="pna"

# Default pagination values
PAGE=1
PER=50
BUCKET_NAME=""
PREFIX=""

# Parse arguments
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    --page)
      PAGE="$2"
      shift 2
      ;;
    --per)
      PER="$2"
      shift 2
      ;;
    *)
      POSITIONAL_ARGS+=("$1")
      shift
      ;;
  esac

done

# Restore positional parameters
set -- "${POSITIONAL_ARGS[@]}"

# Check if bucket name is provided
if [ $# -lt 1 ]; then
    echo "Error:"
    echo "  status: 1"
    echo "  message: Bucket name is required. Usage: $0 <bucket-name> [path] [--page N] [--per N]"
    exit 1
fi

BUCKET_NAME="$1"
PREFIX="${2:-}"

# Validate numeric parameters
if ! [[ "$PAGE" =~ ^[0-9]+$ ]] || [ "$PAGE" -lt 1 ]; then
    echo "Error:"
    echo "  status: 1"
    echo "  message: --page must be a positive integer"
    exit 1
fi

if ! [[ "$PER" =~ ^[0-9]+$ ]] || [ "$PER" -lt 1 ]; then
    echo "Error:"
    echo "  status: 1"
    echo "  message: --per must be a positive integer"
    exit 1
fi

# Build the S3 URI
if [ -n "$PREFIX" ]; then
    S3_URI="s3://${BUCKET_NAME}/${PREFIX}"
else
    S3_URI="s3://${BUCKET_NAME}"
fi

# Execute the AWS S3 ls command and capture output and exit code
# Use --recursive only when a prefix is provided
set +e
if [ -n "$PREFIX" ]; then
    AWS_OUTPUT=$(aws s3 ls "${S3_URI}" --profile "${AWS_PROFILE}" --recursive --page-size 1000 2>&1)
else
    AWS_OUTPUT=$(aws s3 ls "${S3_URI}" --profile "${AWS_PROFILE}" --page-size 1000 2>&1)
fi
AWS_EXIT_CODE=$?
set -e

# Check for errors
if [ $AWS_EXIT_CODE -ne 0 ]; then
    echo "Error:"
    echo "  status: $AWS_EXIT_CODE"
    # Escape and format the error message
    ERROR_MSG=$(echo "$AWS_OUTPUT" | tr '\n' ' ' | sed 's/\"/\\\"/g')
    echo "  message: $ERROR_MSG"
    exit $AWS_EXIT_CODE
fi

# Parse the output into an array (compatible with older bash)
ALL_OBJECTS=()
while IFS= read -r line; do
    ALL_OBJECTS+=("$line")
done <<< "$AWS_OUTPUT"

# Calculate pagination
TOTAL_OBJECTS=${#ALL_OBJECTS[@]}
START_INDEX=$(( (PAGE - 1) * PER ))
END_INDEX=$(( START_INDEX + PER ))

# Calculate showing range
SHOWING_START=$((START_INDEX + 1))
SHOWING_END=$((END_INDEX))

# Adjust if we're past the end
if [ $SHOWING_END -gt $TOTAL_OBJECTS ]; then
    SHOWING_END=$TOTAL_OBJECTS
fi

# Handle out of bounds (when start is beyond total)
if [ $SHOWING_START -gt $TOTAL_OBJECTS ]; then
    # For out of bounds, show the computed position even though no results exist
    # keeping START as computed, END as START-1 to indicate empty range
    SHOWING_END=$((SHOWING_START - 1))
fi

# Get the page of objects
PAGE_OBJECTS=()
ACTUAL_COUNT=0
for (( i=START_INDEX; i<END_INDEX && i<TOTAL_OBJECTS; i++ )); do
    PAGE_OBJECTS+=("${ALL_OBJECTS[$i]}")
    ACTUAL_COUNT=$((ACTUAL_COUNT + 1))
done

# Output in TOON format
echo "pagination:"
echo "  page: $PAGE"
echo "  per: $PER"
echo "  showing: ${SHOWING_START}-${SHOWING_END}"
echo "objects[${ACTUAL_COUNT}]{key,size,date,time}:"

# Parse and output each object (only if array is not empty)
if [ ${#PAGE_OBJECTS[@]} -gt 0 ]; then
  for obj in "${PAGE_OBJECTS[@]}"; do
    # Check for PRE (directory/prefix) format first
    if [[ $obj =~ ^[[:space:]]*PRE[[:space:]]+(.+)$ ]]; then
        KEY="${BASH_REMATCH[1]}"
        # Escape commas in the key if present
        KEY_ESCAPED=$(echo "$KEY" | sed 's/,/\\,/g')
        # Output directory with 0 size and empty date/time
        echo "  ${KEY_ESCAPED},0,,"
    # Then check for regular file format: "2019-01-25 11:09:34     123456 path/to/file"
    elif [[ $obj =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2})[[:space:]]+([0-9]{2}:[0-9]{2}:[0-9]{2})[[:space:]]+([0-9]+)[[:space:]]+(.+)$ ]]; then
        DATE="${BASH_REMATCH[1]}"
        TIME="${BASH_REMATCH[2]}"
        SIZE="${BASH_REMATCH[3]}"
        KEY="${BASH_REMATCH[4]}"
        # Escape commas in the key if present
        KEY_ESCAPED=$(echo "$KEY" | sed 's/,/\\,/g')
        echo "  ${KEY_ESCAPED},${SIZE},${DATE},${TIME}"
    fi
  done
fi

