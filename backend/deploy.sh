#!/bin/bash -ex

if [ -z "$1" ]; then
  echo "usage: $0 S3_BUCKET_NAME"
  exit 1
else
  S3_BUCKET=$1
fi

# package the lambda function code and payload
cd emr
zip lambda.zip index.py
tar -czvf jboot2.tar adam
aws s3 sync . s3://${S3_BUCKET}/ --exclude "*" --include "*.zip" --include "*.tar"
cd -

# modify vqt_lambda_emr_adam.parameters.json to match your VPC/Subnet/Buckets
name="vqt-$(date +%H%M-%d%m%Y)-deployment"

# create the cloudformation stack

aws cloudformation create-stack --stack-name ${name} \
  --template-body file://vqt_lambda_emr_adam.yml \
  --parameters file://vqt_lambda_emr_adam.parameters.json \
  --capabilities CAPABILITY_NAMED_IAM