#!/bin/bash
# Usage:
#   ./scripts/deploy/deploy-service.sh
#   ./scripts/deploy/deploy-service.sh --stage staging --aws-profile durianpy-nonprod
#   ./scripts/deploy/deploy-service.sh --stage prod --aws-profile durianpy-prod --organization durianpy
set -e

ORGANIZATION="${ORGANIZATION:-durianpy}"
STAGE="${STAGE:-staging}"
AWS_PROFILE="${AWS_PROFILE:-durianpy-nonprod}"

while [ $# -gt 0 ]; do
    case "$1" in
        -s|--stage) STAGE="$2"; shift 2 ;;
        -p|--profile|--aws-profile) AWS_PROFILE="$2"; shift 2 ;;
        -o|--organization|--org) ORGANIZATION="$2"; shift 2 ;;
        *) shift ;;
    esac
done

echo "Deploying Events Service [Organization: ${ORGANIZATION}, Stage: ${STAGE}, Profile: ${AWS_PROFILE}]..."
uv export --no-hashes --no-dev -o requirements.txt > /dev/null 2>&1

AWS_SDK_LOAD_CONFIG=1 AWS_PROFILE="${AWS_PROFILE}" npx serverless@3 deploy --stage "${STAGE}" --param="organization=${ORGANIZATION}" --aws-profile "${AWS_PROFILE}" --verbose