# vqt (Variant Query Tool)

Variant Query Tool (vqt) is a server-less client-side web application and CloudFormation stack providing a UI to querying variants stored on [AWS](https://aws.amazon.com) [S3](https://aws.amazon.com/s3/).

Live Demo: [http://vqt.bioteam.net](http://vqt.bioteam.net)

![Serverless](https://raw.githubusercontent.com/bioteam/vqt/assets/serverless.png)

* Client-side web application developed using the [Ember](https://www.emberjs.com) framework
* Served from a [static S3 website](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html) through [CloudFront](https://aws.amazon.com/cloudfront/)
* Event triggered transformation of VCF files to parquet with [Lambda](https://aws.amazon.com/lambda/), [EMR](https://aws.amazon.com/emr/), and [ADAM](https://github.com/bigdatagenomics/adam)
* VCF files queried through AWS APIs ([Cognito](https://aws.amazon.com/cognito/), [Lambda](https://aws.amazon.com/lambda/), [Glue](https://aws.amazon.com/glue/), [Athena](https://aws.amazon.com/athena/), [S3](https://aws.amazon.com/s3/))

## Installation

1. Install prerequisite software (if needed)
2. Clone vqt repository and install node modules
3. Configure AWS Deployment
4. Deploy on AWS

### 1. Install prerequisite software (if needed)

#### On OS X
Install [brew](https://brew.sh), git, watchman, node, ember-cli
```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew install git node watchman
npm install -g ember-cli
```
#### On AWS Linux AMI
Install gcc-c++, make, git, nodejs, ember-cli, node-sass
```sh
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash -
sudo yum install git nodejs
sudo npm install -g ember-cli
npm install node-sass
```

### 2. Clone vqt repository and install node modules

```sh
git clone https://github.com/bioteam/vqt.git
cd vqt
npm install
```

### 3. Configure AWS Deployment

Copy the provided environmental variable **.template.env** to **.env**
```sh
cp .template.env .env
```

Modify **.env** for *your* AWS account.

Note:

* S3_EMR_BUCKET_NAME and S3_ANNOTATIONS_BUCKET_NAME **must already exist**
* S3_VCF_BUCKET_NAME and S3_VARIANTS_BUCKET_NAME **must not already exist**

```sh
AWS_REGION=[AWS Region]
AWS_KEY=[Access Key ID]
AWS_SECRET=[Secret Access Key]
AWS_VPC_SUBNET=[VPC Subnet]
AWS_EC2_KEY_NAME=[EC2 Key]
AWS_SNS_EMAIL_ADDRESS=[SNS Notification Email]
S3_EMR_BUCKET_NAME=[EMR ADAM Code Bucket]
S3_VCF_BUCKET_NAME=[VCF Input Bucket]
S3_VARIANTS_BUCKET_NAME=[Parquet Output Bucket]
S3_ANNOTATIONS_BUCKET_NAME=[Clinvar Annotations Input Bucket]
ATHENA_DATABASE=[Athena Database]
IDENTITY_POOL_ID=[Identity Pool ID]
```

### 4. Deploy on AWS

Upload the lambda function and EMR payload to your S3_EMR_BUCKET_NAME
```sh
aws s3 cp emr_adam/lambda.zip s3://my-emr-bucket/
aws s3 cp emr_adam/jboot2.tar s3://my-emr-bucket/
```
Deploy web application and CloudFormation stack
```sh
ember production deploy
```

## Adding Variants

### Upload variant files to S3_VCF_BUCKET_NAME to trigger EMR parquet formatting

```sh
aws s3 cp example.vcf.gz s3://my-vcf-input-bucket/
```

## Local Development

For rapid development, after installing the prerequisite software (above), you can alternatively run a local installation of the software.

### Launch a local server
```sh
ember server
```

### Perform tests from a web browser

```sh
open http://localhost:4200/tests
```

### Perform tests from the command line

```sh
ember test
```

## Built With

* [Ember](https://www.emberjs.com)
* [ember-cli-bootstrap-4](https://github.com/kaermorchen/ember-cli-bootstrap-4)
* [emberx-select](https://github.com/thefrontside/emberx-select)
* [ember-cli-deploy](http://ember-cli-deploy.com)
* [ember-cli-deploy-cloudformation](https://github.com/kaliber5/ember-cli-deploy-cloudformation)
* [ember-cli-dotenv](https://github.com/fivetanley/ember-cli-dotenv)
* [ember-auto-import](https://github.com/ef4/ember-auto-import)
* [aws-sdk](https://www.npmjs.com/package/aws-sdk)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/bioteam/vqt/tags).

## Authors

* William Van Etten, PhD - [BioTeam](https://bioteam.net)
* See also the list of [contributors](https://github.com/bioteam/vqt/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Aaron Friedman - ["Interactive Analysis of Genomic Datasets Using Amazon Athena"](https://aws.amazon.com/blogs/big-data/interactive-analysis-of-genomic-datasets-using-amazon-athena/)
* [Kevin Pfefferle](http://twitter.com/kpfefferle) - ["Deploying Ember to AWS CloudFront"](http://blog.testdouble.com/posts/2015-11-03-deploying-ember-to-aws-cloudfront-using-ember-cli-deploy)
* [singledigit/cognito.yaml](https://gist.githubusercontent.com/singledigit/2c4d7232fa96d9e98a3de89cf6ebe7a5/raw/c4d06b6ca946973818c1e10dbf5ce4541bdf711d/cognito.yaml)