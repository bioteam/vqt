import Route from '@ember/routing/route';
import AWS from 'aws-sdk';
import ENV from "vqt/config/environment";

export default Route.extend({
  actions: {
    selectZygosity (value) {
      this.set('zygosity', value);
    },
    query (sql) {
      // console.log(sql);
      document.getElementById("query-results").innerHTML = 'Querying...';
      // Configure AWS SDK for JavaScript
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: ENV.APP.identityPoolId
      });
      AWS.config.update({region: 'us-east-1'});

      AWS.config.credentials.get(function(err) {
        if (err) {
          alert('Error retrieving credentials.');
          console.error(err);
          return;
        }
        var lambda = new AWS.Lambda({
          region: 'us-east-1',
          apiVersion: '2017-05-18'
        });
        // var query = "SELECT sv.sampleid, sv.chromosome, sv.startposition, sv.endposition, sv.referenceallele, sv.alternateallele, sv.genotype0, sv.genotype1, count(*)/cast(numsamples AS DOUBLE) AS genotypefrequency, cv.rsid, cv.genesymbol, cv.clinicalsignificance, cv.phenotypelist FROM variants sv CROSS JOIN (SELECT count(1) AS numsamples FROM (SELECT DISTINCT sampleid FROM variants WHERE sampleid LIKE 'NA12%')) JOIN annotations cv ON sv.chromosome = cv.chromosome AND sv.startposition = cv.startposition - 1 AND sv.endposition = cv.endposition AND sv.referenceallele = cv.referenceallele AND sv.alternateallele = cv.alternateallele WHERE assembly='GRCh37' AND cv.clinicalsignificance LIKE '%Pathogenic%' AND sampleid LIKE 'NA12%' GROUP BY  sv.sampleid, sv.chromosome, sv.startposition, sv.endposition, sv.referenceallele, sv.alternateallele, sv.genotype0, sv.genotype1, cv.clinicalsignificance, cv.genesymbol, cv.phenotypelist, cv.rsid, numsamples ORDER BY  genotypefrequency DESC LIMIT 50"
        lambda.invoke({
          FunctionName : ENV.APP.lambdaFunction,
          InvocationType : 'RequestResponse',
          LogType : 'None',
          Payload : JSON.stringify({query: sql})
        }, function(err, data) {
          if (err) {
            alert(err);
          } else {
            console.log(JSON.parse(data.Payload));
            if (JSON.parse(data.Payload).ResultSet) {
              let txt = '<table class="table">';
              var rows = JSON.parse(data.Payload).ResultSet.Rows;
              var x;
              txt += '<thead><tr>';
              txt += '<th>#</th><th>Sample</th><th>Variant</th><th>Genotype</th><th>dbSNP</th><th>Pathogenicity</th><th>Gene</th><th>Phenotype</th><th>Frequency</th>';
              txt += '</tr></thead>';
              for (x = 1; x < rows.length; x++) {
                let columns = rows[x].Data;
                let variant = columns[1].VarCharValue + '-' + columns[2].VarCharValue + '-' + columns[3].VarCharValue + '-' + columns[4].VarCharValue + '-' + columns[5].VarCharValue;
                let ucsc_reqion = columns[1].VarCharValue + ':' + columns[2].VarCharValue + '-' + columns[3].VarCharValue;
                let ucsc_link = '<a href="http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr' + ucsc_reqion + '" target="_blank">' + variant + '</a>';
                let genotype = columns[6].VarCharValue + ',' + columns[7].VarCharValue;
                let frequency = parseFloat(columns[12].VarCharValue).toFixed(4);
                let dbsnp_link = '<a href="https://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=' + columns[8].VarCharValue + '" target="_blank">' + columns[8].VarCharValue + '</a>';
                let ncbi_link = '<a href="http://www.ncbi.nlm.nih.gov/gene/?term=' + columns[10].VarCharValue + '[sym] AND human[ORGN] AND srcdb_refseq[PROP]" target="_blank">' + columns[10].VarCharValue + '</a>';
                txt += '<tr scope="row"><td>' + x + '</td><td>' + columns[0].VarCharValue + '</td><td>' + ucsc_link + '</td><td>' + genotype + '</td><td>' + dbsnp_link + '</td><td>' + columns[9].VarCharValue + '</td><td>' + ncbi_link + '</td><td>' + columns[11].VarCharValue + '</td><td>' + frequency + '</td></tr>';
              }
              document.getElementById("query-results").innerHTML = txt;
            } else {
              document.getElementById("query-results").innerHTML = 'Query Timeout';
            }
          }
        });
      });
    }
  },
  model: function() {
    return this.store.createRecord('query');
  }
});
