"""
# (c) 2017 Amazon Web Services, Inc. or its affiliates. All Rights Reserved. This AWS Content is provided subject to the terms of the AWS Customer
# Agreement available at  or other written agreement between Customer and Amazon Web Services, Inc.
# ADAM-EMR ETL pipeline
# Creates EMR cluster and bootstrap ADAM genomic tool and run step jobs to convert .vcf.gz to parquet
# API Triggers:
# Services: Cloudwatch Events (trigger), Amazon EMR, SNS, Cloudwatch
# Python 3.6 - Lambda - Last Modified 05/04/2018
"""

import logging
import os

import boto3

s3 = boto3.client('s3')
emr = boto3.client('emr')

def lambda_handler(event, context):
    """
    Lambda event handler that processes event received

    Args:
        event: Event that triggers the lambda function
        context: Contains Lambda environment information
    """
    setup_logging()
    log.info('Got an event!')
    log.info(event)
    if 'source' in event:
        try:
            step_status = event['detail']['state']
            log.info(step_status)
            log.info(type(event['detail']['state']))
            if step_status == "COMPLETED":
                step_name = event['detail']['name']
                log.info(step_name)
                log.info(type(event['detail']['name']))
                if "AdamSubmit-transformGenotypes" in step_name:
                    message=None
                    invoke_alert(event, context, message)
                    cluster_id = event['detail']['clusterId']
                    step_id = event['detail']['stepId']
                    if get_emr_cluster_description(cluster_id, context):
                        s3_output = get_s3_output(step_id, cluster_id)
                        files = cleanup_parquet(s3_output)
                        if files is not None:
                            copy_files(s3_output, files)
                else:
                    return
            else:
                message="Alert-Step failed to run"
                invoke_alert(event, context, message)
                return
        except Exception as e:
            log.error(e)
            message = "Alert - Failed to clean up processed files" + "\n\n"
            invoke_alert(event, context, message)
    else:
        vcf_file = check_vcf(event)
        cluster_id = check_running_cluster(context)
        if cluster_id is None:
            emr_cluster(vcf_file, context)
        else:
            create_step(cluster_id, vcf_file)
        
def check_vcf(event):
    """
    Function to get S3 object key

    Args:
        event: Event that triggers the lambda function
    Returns:
	    Returns string that contains VCF_file name or return None
    """
    for record in (event["Records"]):
        vcf_file = (record["s3"]["object"]["key"])
        return (vcf_file)
        
def check_running_cluster(context):
    """
    Function check EMR cluster status and return cluster ID

    Args:
        context: Context contains EMR detail
    Returns:
	    Returns string that contains EMR Cluster ID
    """
    try:
        response = emr.list_clusters(
            ClusterStates=["STARTING","BOOTSTRAPPING","RUNNING", "WAITING"]
            )
        log.info(response)
        for cluster in response['Clusters']:
            if cluster['Name'] == context.function_name + "-ADAM-EMR":
                return cluster['Id']
    except Exception as e:
        log.error(e)
        return None

def create_step(cluster_id,vcf_file):
    """
    Function create EMR Step Job

    Args:
        cluster_id: EMR Cluster ID
        vcf_file: vcf input file (s3 object key)
    Returns:
	    Create EMR Custer step job
    """
    try:
        driver_memory = (os.environ['driver_memory'], '1G')[os.environ['driver_memory']==""]
        executor_memory = (os.environ['executor_memory'], '1G')[os.environ['executor_memory']==""]
        s3_vcf_input_location = os.environ['vcf_location']
        s3_parquet_output_location = os.environ['parquet_location']
        s3_vcf_input_location = "s3://"+s3_vcf_input_location+"/"+vcf_file
        s3_parquet_output_location = "s3://"+s3_parquet_output_location+'/'+vcf_file
        response = emr.add_job_flow_steps(
            JobFlowId = cluster_id,
            Steps=[
                {
            'Name': 'AdamSubmit-transformGenotypes',
            'ActionOnFailure': 'CONTINUE',
                    'HadoopJarStep': {
                        'Jar': 'command-runner.jar',
                        'Args': ["/home/hadoop/adam/bin/adam-submit", "transformGenotypes", s3_vcf_input_location, s3_parquet_output_location]
                    }
                }
            ]
            )
        log.info(response)
    except Exception as e:
        log.error(e)
        return None

def emr_cluster(vcf_file, context):
    """
    Function create EMR Cluster

    Args:
        vcf_file: T0 get vcf file object key
        context: To get Lambda function Name
    Returns:
	    Create EMR Custer
    """
    master_instance_type = os.environ['master_instance_type']
    core_instance_type = os.environ['core_instance_type']
    no_core_instances = os.environ['no_core_instances']
    subnet_id = os.environ['subnet_id']
    ec2_keypair = os.environ['ec2_keypair']
    emr_release = os.environ['emr_release_label']
    s3_script_location = os.environ['code_location'] # demo0001/VCF2Parquet.scala
    s3_vcf_input_location = os.environ['vcf_location']
    s3_parquet_output_location = os.environ['parquet_location']
    driver_memory = (os.environ['driver_memory'], '1G')[os.environ['driver_memory']==""]
    executor_memory = (os.environ['executor_memory'], '1G')[os.environ['executor_memory']==""]
    ec2_role = os.environ['ec2_role']
    emr_service_role = os.environ['emr_service_role']
    
    s3_vcf_input_location = "s3://"+s3_vcf_input_location+"/"+vcf_file
    s3_parquet_output_location = "s3://"+s3_parquet_output_location+'/'+vcf_file
    #spark_driver_args = 'spark.driver.args='+s3_vcf_input_location+' '+s3_parquet_output_location

    clusterName = context.function_name + "-ADAM-EMR"
    logUri='s3n://'+ s3_script_location + '/emr-logs/'
    applications=[{'Name': 'Hadoop'}, {'Name': 'Spark'}, {'Name': 'Zeppelin'}]
    instances = {
        'MasterInstanceType': master_instance_type,
        'SlaveInstanceType': core_instance_type,
        'InstanceCount': int(no_core_instances),
        'KeepJobFlowAliveWhenNoSteps': False,
        'TerminationProtected': False,
        'Ec2SubnetId': subnet_id,
        'Ec2KeyName': ec2_keypair
    }
    bootstrapActions=[{
        'Name': 'Download-Adam',
        'ScriptBootstrapAction': {
            'Path': 'file:/usr/bin/aws',
            'Args': [
                's3',
                'cp',
                's3://'+s3_script_location+'/jboot2.tar',
                '/home/hadoop/jboot/'
            ]
        }
    },
    {
        'Name': 'Extract-ADAM-binary',
        'ScriptBootstrapAction': {
            'Path': 'file:/bin/tar',
            'Args': [
                '-xvf',
                '/home/hadoop/jboot/jboot2.tar',
                '-C',
                '/home/hadoop/jboot',
                '--warning=no-unknown-keyword'
            ]
        }
    },
    {
        'Name': 'Install-Lib',
        'ScriptBootstrapAction': {
            'Path': 'file:/home/hadoop/jboot/adam/lib.sh'
    }
    },
    {
        'Name': 'Build-ADAM-Tool',
        'ScriptBootstrapAction': {
            'Path': 'file:/home/hadoop/jboot/adam/adam_bootstrap.sh'
    }
    }
    ]
    steps=[       
        {
        'Name': 'Copy-Adam-Jars',
        'ActionOnFailure': 'CONTINUE',
        'HadoopJarStep': {
            'Jar': 'command-runner.jar',
            'Args': ["sudo", "sh", "/home/hadoop/jboot/adam/adam-jar.sh"]
            }
        },
        {
        'Name': 'AdamSubmit-transformGenotypes',
        'ActionOnFailure': 'CONTINUE',
        'HadoopJarStep': {
            'Jar': 'command-runner.jar',
            'Args': ["/home/hadoop/adam/bin/adam-submit", "transformGenotypes", s3_vcf_input_location, s3_parquet_output_location]
            }
        }
    ]
    try:
        emr.run_job_flow(
            Name = clusterName,
            LogUri = logUri,
            ReleaseLabel = emr_release,
            Instances = instances,
            BootstrapActions = bootstrapActions,
            Steps = steps,
            Applications = applications,
            VisibleToAllUsers = True,
            JobFlowRole = ec2_role,
            ServiceRole = emr_service_role
        )
    except Exception as e:
        log.error(e)
        return None

def get_s3_output(step, cluster_id):
    """
    Function retrun output directory structure

    Args:
        step: get Step Job detail
        cluster_id: Get Cluser Id
    Returns:
	    Returns S3 ouput directory structure
    """
    try:
        response = emr.describe_step(
            ClusterId = cluster_id,
            StepId = step)
        log.info(response)
        return (response['Step']['Config']['Args'][11].split("//")[1])
    except Exception as e:
        log.error(e)
        return None

def get_emr_cluster_description(cluster_id, context):
    """
    Function retrun emr cluser deail

    Args:
        context: Get function name
        cluster_id: Get Cluser Id
    Returns:
	    Returns EMR cluster description
    """
    try:
        response = emr.describe_cluster(
            ClusterId = cluster_id)
        if response['Cluster']['Name'] == context.function_name + "-ADAM-EMR":
            return True
        else:
            return False
    except Exception as e:
        log.error(e)
        return None

def get_matching_s3_keys(bucket, prefix='', suffix=''):
    """
    Generate the keys in an S3 bucket.

    Args:
        bucket: Name of the S3 bucket.
        prefix: Only fetch keys that start with this prefix (optional).
        suffix: Only fetch keys that end with this suffix (optional).
    """
    try:
        s3 = boto3.client('s3')
        kwargs = {'Bucket': bucket}

        # If the prefix is a single string (not a tuple of strings), we can
        # do the filtering directly in the S3 API.
        if isinstance(prefix, str):
            kwargs['Prefix'] = prefix

        while True:

            # The S3 API response is a large blob of metadata.
            # 'Contents' contains information about the listed objects.
            resp = s3.list_objects_v2(**kwargs)
            for obj in resp['Contents']:
                key = obj['Key']
                if key.startswith(prefix) and key.endswith(suffix):
                    yield key

            # The S3 API is paginated, returning up to 1000 keys at a time.
            # Pass the continuation token into the next response, until we
            # reach the final page (when this field is missing).
            try:
                kwargs['ContinuationToken'] = resp['NextContinuationToken']
            except KeyError:
                break
    except Exception as e:
        log.error(e)

def cleanup_parquet(s3_output):
    """
    Function return parquet file lists

    Args:
        s3_output: output directory structure
    Returns:
	    Returns list of parquet files
    """
    bucket = s3_output.split('/')[0]
    startAfter = s3_output.split(bucket+'/')[1]
    list_of_files = []
    for key in get_matching_s3_keys(bucket=bucket, prefix=startAfter, suffix='.parquet'):
        list_of_files.append(key)
    if len(list_of_files) > 0:
        return list_of_files
    else:
        return None

def copy_files(s3_output, files):
    """
    Function copy files to clean destination

    Args:
        s3_output: output directory structure
        files: list_of_files retuns parquet files
    Returns:
	    Copy parquet(only) files to clean directory
    """
    try:
        bucket = s3_output.split('/')[0]
        length_input_file = len(s3_output.split('/'))
        input_file = s3_output.split('/')[length_input_file-1]
        for file in files:
            renamed_file_length = len(file.split('/'))
            renamed_file = file.split('/')[renamed_file_length-1]
            renamed_file = input_file + '-' + renamed_file
            copy_source = {'Bucket': bucket, 'Key': file}
            s3.copy_object(CopySource = copy_source, Bucket = bucket, Key = 'clean/'+renamed_file)
    except Exception as e:
        log.error(e)
        return None
def invoke_alert(event, context, message):
    """
    Invoke Alert Function

    Args:
        event: Event that triggers the lambda function
        context: Contains Lambda environment information
    Returns:
	    Evalutes response and sends out SNS alert.
    """
    service_string = event["source"].split('.')
    service = service_string[1]

    if message is None:
        subject = "Alert - EMR Step Completed"
        message = "Alert - EMR Step Completed"  "\n\n"
        message += 'EMR Step completed successfully: ' + event['detail']['stepId'] + "\n"
    else:
        subject = "Alert - Cleanup Failed"
    message += 'EMR Step name: ' + event['detail']['name'] + "\n"
    message += 'EMR Cluster: ' + event['detail']['clusterId'] + "\n"
    message += 'Account: ' + event['account'] + "\n"
    message += "Region: " + event["region"] + "\n"
    message += "\n\n"
    message += "This notification was generated by the Lambda function " + \
        context.invoked_function_arn

    outbound_topic_arn = os.environ["outbound_topic_arn"]
    findsnsregion = outbound_topic_arn.split(":")
    snsregion = findsnsregion[3]
    sendclient = boto3.client('sns', region_name=snsregion)
    try:
        sendclient.publish(
            TopicArn=outbound_topic_arn,
            Message=message,
            Subject=subject
        )
    except Exception as err:
        log.info(err)
        return False

def setup_logging():
    """
    Logging Function.

    Creates a global log object and sets its level.
    """
    global log
    log = logging.getLogger()
    log_levels = {'INFO': 20, 'WARNING': 30, 'ERROR': 40}

    if 'logging_level' in os.environ:
        log_level = os.environ['logging_level'].upper()
        if log_level in log_levels:
            log.setLevel(log_levels[log_level])
        else:
            log.setLevel(log_levels['ERROR'])
            log.error("The logging_level environment variable is not set to INFO, WARNING, or \
                        ERROR.  The log level is set to ERROR")
    else:
        log.setLevel(log_levels['ERROR'])
        log.warning('The logging_level environment variable is not set. The log level is set to \
                    ERROR')
    log.info('Logging setup complete - set to log level ' + str(log.getEffectiveLevel()))
