#!/bin/bash
set -x -e
if grep isMaster /mnt/var/lib/info/instance.json | grep true;
then
	IS_MASTER=true
fi

if [ "$IS_MASTER" = true ]; then
	touch /var/log/adam.log
	adam_log=/var/log/adam.log

	# Install GIT
	sudo yum install -y git

	# Download Maven3.5.0 
	cd $HOME/jboot/adam/
	tar -zxvf apache-maven-3.5.2-bin.tar.gz 

	# Set path for mvn
	export PATH=$HOME/jboot/adam/apache-maven-3.5.2/bin:$PATH
	echo -e "\nexport PATH=$PATH:/home/hadoop/jboot/adam/apache-maven-3.5.2/bin" >> $HOME/.bashrc

	# Clone adam project
	cd $HOME
	/usr/bin/git clone -b maint_spark2_2.11-0.25.0 https://github.com/bigdatagenomics/adam.git 

	# Build ADAM
	cd $HOME/adam/
	mvn clean package -DskipTests

	# Set path for adam-shell & adam-submit
	echo -e "\nexport PATH=$HOME/adam/bin:$PATH" >> $HOME/.bashrc

fi
