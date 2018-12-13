# vqt (Variant Query Tool)

## ETL Pipeline

Variants in VCF format are converted to Parquet format using [ADAM](https://github.com/bigdatagenomics/adam).

### AWS Installation

![Backend](https://raw.githubusercontent.com/bioteam/vqt/assets/backend.png)

#### Create a new S3 bucket for lambda function and EMR payload

```sh
aws cloudformation create-stack --stack-name MyLambdaBucket --template-body file://vqt_lambda_bucket.yml
```

#### Upload the lambda function and EMR payload to your bucket

```sh
aws s3 cp lambda/lambda.zip s3://MyBucket
aws s3 cp emr/jboot2.tar s3://MyBucket
```

#### Create a new EMR stack with lambda function trigger

```sh
stack_name="vqt-lambda-emr-adam"
# modify vqt_lambda_emr_adam.parameters.json to match your VPC/Subnet/Buckets

aws cloudformation create-stack --stack-name $stack_name \
  --template-body file://vqt_lambda_emr_adam.yml \
  --parameters file://vqt_lambda_emr_adam.parameters.json \
  --capabilities CAPABILITY_NAMED_IAM
```

### Running ETL jobs

#### Upload variant files to pVCFBucket to trigger EMR ETL job flow

```sh
aws s3 cp variants/example.vcf.gz s3://InputBucket/
```

#### Watch for active EMR clusters and jobs

```sh
aws emr list-clusters --active

aws emr list-steps --cluster-id "j-xxxxxxxxxxxxx"
```