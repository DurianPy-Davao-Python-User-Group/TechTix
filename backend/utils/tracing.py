import os

from aws_xray_sdk.core import patch_all


def enable_tracing() -> None:
    """Patch boto3 so downstream calls become X-Ray subsegments and the trace
    header propagates through SQS. No-op outside Lambda so local runs and tests
    do not emit context-missing errors."""
    if os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
        patch_all()
