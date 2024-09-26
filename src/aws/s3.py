import boto3
import json
from botocore.exceptions import ClientError
from flask import current_app
from src.config import CONFIG

def get_project_data_from_s3():
    """Fetch project data from S3 bucket"""
    s3 = boto3.client('s3')
    try:
        response = s3.get_object(
            Bucket=CONFIG['s3']['bucket'],
            Key=CONFIG['s3']['input_key']
        )
        content = response['Body'].read().decode('utf-8')
        return json.loads(content)
    except ClientError as e:
        current_app.logger.error(f"Error fetching data from S3: {e}")
        return None

def put_object_to_s3(file_obj, object_name, content_type):
    """
    Upload an object to S3 bucket
    """
    s3 = boto3.client('s3')
    try:
        s3.put_object(
            Bucket=CONFIG['s3']['bucket'],
            Key=object_name,
            Body=file_obj,
            ContentType=content_type
        )
        return True
    except ClientError as e:
        current_app.logger.error(f"Error uploading object to S3: {e}")
        return False