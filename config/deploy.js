/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    build: {
      environment: "production"
    },
    pipeline: {
      // This setting runs the ember-cli-deploy activation hooks on every deploy
      // which is necessary in order to run ember-cli-deploy-cloudfront.
      // To disable CloudFront invalidation, remove this setting or change it to `false`.
      // To disable ember-cli-deploy-cloudfront for only a particular environment, add
      // `ENV.pipeline.activateOnDeploy = false` to an environment conditional below.
      activateOnDeploy: false
    },
    "revision-data": {
      "type": "version-commit"
    },
    cloudformation: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: process.env.AWS_REGION,
      stackName: `${require('../package.json').name}-${deployTarget}`,
      templateBody: 'file://cfn.yaml',
      capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
      parameters: {
        // pDomainName: process.env.CFN_DOMAINNAME,
        // pCFCertificate: process.env.CFN_CFCERTIFICATE,
        pSubnet: process.env.AWS_VPC_SUBNET,
        pEC2KeyName: process.env.AWS_EC2_KEY_NAME,
        pSNSEmailAddress: process.env.AWS_SNS_EMAIL_ADDRESS,
        pEmrCodeBucket: process.env.S3_EMR_BUCKET_NAME,
        pVCFBucket: process.env.S3_VCF_BUCKET_NAME,
        pVariantsBucket: process.env.S3_VARIANTS_BUCKET_NAME,
        pAnnotationsBucket: process.env.S3_ANNOTATIONS_BUCKET_NAME,
        pGlueDatabase: process.env.ATHENA_DATABASE
      }
    },
    s3: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      bucket(context) {
        return context.cloudformation.outputs.AssetsBucket;
      },
      region: process.env.AWS_REGION,
      filePattern: '*'
    }
  };

  // if (deployTarget === 'staging') {
  //   ENV.s3.bucket = process.env.STAGING_BUCKET;
  //   ENV.s3.region = process.env.STAGING_REGION;
  // }

  // if (deployTarget === 'production') {
  //   ENV.s3.bucket = process.env.PRODUCTION_BUCKET;
  //   ENV.s3.region = process.env.PRODUCTION_REGION;
  // }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
