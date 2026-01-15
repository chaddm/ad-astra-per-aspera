#!/usr/bin/env bash
#
# list_pna_project_files.sh - Find project files in nexus-import bucket
#
# Usage: list_pna_project_files.sh --project-number NNNNNNNN
#
# This script searches s3://nexus-import/project/ for all project files
# matching the given project number. Results are sorted by build ID (folder number)
# in descending order and returned in TOON format.
#
# Parameters:
#   --project-number : Required. Eight-digit project number (leading zeros allowed)

set -euo pipefail

# Use the pna profile
AWS_PROFILE="pna"
BUCKET="nexus-import"
PREFIX="project/"

# Parse arguments
PROJECT_NUMBER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --project-number)
      PROJECT_NUMBER="$2"
      shift 2
      ;;
    *)
      echo "Error:"
      echo "  status: 1"
      echo "  message: Unknown parameter: $1. Usage: $0 --project-number NNNNNNNN"
      exit 1
      ;;
  esac
done

# Check if project number is provided
if [ -z "$PROJECT_NUMBER" ]; then
    echo "Error:"
    echo "  status: 1"
    echo "  message: --project-number is required. Usage: $0 --project-number NNNNNNNN"
    exit 1
fi

# Validate project number (should be numeric, 8 digits)
if ! [[ "$PROJECT_NUMBER" =~ ^[0-9]{8}$ ]]; then
    echo "Error:"
    echo "  status: 1"
    echo "  message: --project-number must be an 8-digit number (leading zeros allowed)"
    exit 1
fi

# Build the S3 URI
S3_URI="s3://${BUCKET}/${PREFIX}"

# Execute the AWS S3 ls command and capture output and exit code
set +e
AWS_OUTPUT=$(aws s3 ls "${S3_URI}" --profile "${AWS_PROFILE}" --recursive --page-size 1000 2>&1)
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

# Parse the output and filter for matching project files
# Pattern: {execution_id}/{project_number}_*.tgz
MATCHING_FILES=()

while IFS= read -r line; do
    # Parse AWS S3 ls output format: "2019-01-25 11:09:34     123456 path/to/file"
    if [[ $line =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2})[[:space:]]+([0-9]{2}:[0-9]{2}:[0-9]{2})[[:space:]]+([0-9]+)[[:space:]]+(.+)$ ]]; then
        DATE="${BASH_REMATCH[1]}"
        TIME="${BASH_REMATCH[2]}"
        SIZE="${BASH_REMATCH[3]}"
        KEY="${BASH_REMATCH[4]}"
        
        # Extract filename from key
        FILENAME=$(basename "$KEY")
        
        # Check if filename matches the pattern and starts with project number
        # Pattern: {project_number}_v{version}.tgz OR {project_number}_{pgid}_v{version}.tgz OR {project_number}_{pgid}_v{version}_{full|diff}.tgz
        if [[ $FILENAME =~ ^${PROJECT_NUMBER}_.*\.tgz$ ]]; then
            # Extract execution ID (folder number) from the key
            # Key format: project/{execution_id}/{filename}
            if [[ $KEY =~ project/([0-9]+)/ ]]; then
                EXECUTION_ID="${BASH_REMATCH[1]}"
                
                # Store: execution_id|key|size|date|time
                MATCHING_FILES+=("${EXECUTION_ID}|${KEY}|${SIZE}|${DATE}|${TIME}")
            fi
        fi
    fi
done <<< "$AWS_OUTPUT"

# Sort by execution ID (build ID) in descending order
# Sort by execution ID (build ID) in descending order
if [ ${#MATCHING_FILES[@]} -gt 0 ]; then
    IFS=$'\n' SORTED_FILES=($(sort -t'|' -k1,1rn <<< "${MATCHING_FILES[*]}"))

else
    SORTED_FILES=()
fi


# Count matching files
FILE_COUNT=${#SORTED_FILES[@]}

# Output in TOON format
echo "bucket: ${BUCKET}"
echo "projects[${FILE_COUNT}]{name,size,date,time}:"

# Output each file (only if array is not empty)
if [ ${#SORTED_FILES[@]} -gt 0 ]; then
  for file_line in "${SORTED_FILES[@]}"; do
      # Split on pipe delimiter
      IFS='|' read -r exec_id key size date time <<< "$file_line"
      
      # Escape commas in key if present
      KEY_ESCAPED=$(echo "$key" | sed 's/,/\\,/g')
      
      echo "  ${KEY_ESCAPED},${size},${date},${time}"
  done
fi