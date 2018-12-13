curl -s -O http://giab.s3.amazonaws.com/current.tree
grep file current.tree | cut -f 1 | sed -e 's/^ftp//' | awk '{print "http://giab.s3.amazonaws.com" $1}' > giab_s3_urls

