# vqt (Variant Query Tool)

vqt is a server-less, client-side javascript application that provides a Web UI for querying variants stored on [AWS](https://aws.amazon.com) [S3](https://aws.amazon.com/s3/).

Live Demo: [http://vqt.bioteam.net](http://vqt.bioteam.net)

![Serverless](https://raw.githubusercontent.com/bioteam/vqt/assets/serverless.png)

* Developed using the [Ember](https://www.emberjs.com) framework
* Served from a [static S3 website](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html)
* Queries data through AWS APIs ([Cognito](https://aws.amazon.com/cognito/), [Lambda](https://aws.amazon.com/lambda/), [Athena](https://aws.amazon.com/athena/), [S3](https://aws.amazon.com/s3/))

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [Deployment](#deployment) for notes on how to deploy the project on [S3](https://aws.amazon.com/s3/).

### Developer Prerequisites

You will need the following software to run the project on your local machine for development and testing purposes. [Homebrew](https://git-scm.com/) makes it easy to install [Git](https://git-scm.com/), [Watchman](https://facebook.github.io/watchman/), and [Node.js](https://nodejs.org/). And [Node.js](https://nodejs.org/) makes it easy to install [Ember CLI](https://ember-cli.com/).

* [Homebrew](https://git-scm.com/)
* [Git](https://git-scm.com/)
* [Watchman](https://facebook.github.io/watchman/)
* [Node.js](https://nodejs.org/)
* [Ember CLI](https://ember-cli.com/)

### Installing Developer Prerequisites

Install prerequisites (if needed): brew, git, watchman, node, ember-cli.

#### OS X

1. Install [homebrew](https://brew.sh)

2. Install git, node, watchman

```sh
brew install git node watchman
```

1. Install ember-cli

```sh
npm install -g ember-cli
```

## Installation

* `git clone https://github.com/bioteam/vqt.git`
* `cd vqt`
* `npm install`
* `cp .template.env .env`
* Populate .env with values from [Cognito](https://github.com/bioteam/vqt/wiki/Configure-Cognito,-IAM,-and-Lambda) and [CloudFront](https://github.com/bioteam/vqt/wiki/Configure-CloudFront)
* `ember server`
* `open http://localhost:4200`

## Running the tests

### From a web browser

```sh
open http://localhost:4200/tests
```

### From the command line

```sh
ember test
```

## Deployment

```sh
ember deploy production
```

## ETL Pipeline

Variants in VCF format can be converted to Parquet format using [ADAM](https://github.com/bigdatagenomics/adam).

### Serverless ETL Backend

![Backend](https://raw.githubusercontent.com/bioteam/vqt/assets/backend.png)

#### Upload the lambda function and EMR payload to your bucket

```sh
aws s3 cp backend/emr/lambda.zip s3://VQTLambdaBucket
aws s3 cp backend/emr/jboot2.tar s3://VQTLambdaBucket
```

#### Create the EMR stack with lambda function trigger

```sh
ember deploy backend
```

### Running ETL jobs

#### Upload variant files to pVCFBucket to trigger EMR ETL job flow

```sh
aws s3 cp variants/example.vcf.gz s3://VCFInputBucket/
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