# vqt (Variant Query Tool)

vqt is a server-less, client-side javascript application that provides a Web UI for querying variants stored on [AWS](https://aws.amazon.com) [S3](https://aws.amazon.com/s3/).

Live Demo: [http://vqt.bioteam.net](http://vqt.bioteam.net)

![Serverless](https://raw.githubusercontent.com/bioteam/vqt/assets/serverless.png)

* Developed using the [Ember](https://www.emberjs.com) framework
* Served from a [static S3 website](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html)
* Queries data through AWS APIs ([Cognito](https://aws.amazon.com/cognito/), [Lambda](https://aws.amazon.com/lambda/), [Athena](https://aws.amazon.com/athena/), [S3](https://aws.amazon.com/s3/))

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on [S3](https://aws.amazon.com/s3/).

### Prerequisites

You will need the following to run the project on your local machine for development and testing purposes. [Homebrew](https://git-scm.com/) makes it easy to install [Git](https://git-scm.com/), [Watchman](https://facebook.github.io/watchman/), and [Node.js](https://nodejs.org/). And [Node.js](https://nodejs.org/) makes it easy to install [Ember CLI](https://ember-cli.com/).

* [AWS account](https://aws.amazon.com)
* [Homebrew](https://git-scm.com/)
* [Git](https://git-scm.com/)
* [Watchman](https://facebook.github.io/watchman/)
* [Node.js](https://nodejs.org/)
* [Ember CLI](https://ember-cli.com/)

### Installing Prerequisites

Install prerequisites (if needed): brew, git, watchman, node, ember-cli.

1. Install brew
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

2. Install git, node, watchman
```
brew install git node watchman
```

3. Install ember-cli
```
npm install -g ember-cli
```

## Installation

* `git clone https://github.com/bioteam/vqt.git`
* `cd vqt`
* `npm install`
* `ember server`
* `open http://localhost:4200`

## Running the tests

### From a web browser

```
open http://localhost:4200/tests
```

### From the command line

```
ember test
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Ember](https://www.emberjs.com)
* [ember-cli-bootstrap-4](https://github.com/kaermorchen/ember-cli-bootstrap-4)
* [emberx-select](https://github.com/thefrontside/emberx-select)
* [ember-cli-deploy](http://ember-cli-deploy.com)
* [ember-cli-deploy-aws-pack](https://github.com/kpfefferle/ember-cli-deploy-aws-pack)
* [ember-cli-dotenv](https://github.com/fivetanley/ember-cli-dotenv)
* [ember-auto-import](https://github.com/ef4/ember-auto-import)
* [aws-sdk](https://www.npmjs.com/package/aws-sdk)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/bioteam/vqt/tags). 

## Authors

* **William Van Etten, PhD** - *Initial work* - [BioTeam](https://bioteam.net)

See also the list of [contributors](https://github.com/bioteam/vqt/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Interactive Analysis of Genomic Datasets Using Amazon Athena](https://aws.amazon.com/blogs/big-data/interactive-analysis-of-genomic-datasets-using-amazon-athena/)
* [Deploying Ember to AWS CloudFront](http://blog.testdouble.com/posts/2015-11-03-deploying-ember-to-aws-cloudfront-using-ember-cli-deploy)
