import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  samples: DS.attr('string'),
  variant: DS.attr('string'),
  genes: DS.attr('string'),
  rsid: DS.attr('string'),
  frequency: DS.attr('number'),
  zygosity: DS.attr('string'),
  pathogenicity: DS.attr('string'),
  query: computed('samples', 'variant', 'genes', 'rsid', 'frequency', 'zygosity', 'pathogenicity',function() {
    var samplesClause = (this.get('samples') && this.get('samples').length > 0) ? "v.sampleid IN ('" + this.get('samples').replace(/ /g,'').split(',').join("','") + "')" : "";
    var variantClause = (this.get('variant') && this.get('variant').length > 0 && this.get('variant').split('-').length == 5) ? "v.chromosome = '" + this.get('variant').split('-')[0] + "'" + " AND v.startposition = " + this.get('variant').split('-')[1] + " AND v.endposition = " + this.get('variant').split('-')[2] + " AND v.referenceallele = '" + this.get('variant').split('-')[3] + "'" + " AND v.alternateallele = '" + this.get('variant').split('-')[4] + "'" : "";
    var genesClause = (this.get('genes') && this.get('genes').length > 0) ? "a.genesymbol IN ('" + this.get('genes').replace(/ /g,'').split(',').join("','") + "')" : "";
    var rsidClause = (this.get('rsid') && this.get('rsid').length > 0) ? "a.rsid = '" + this.get('rsid') + "'" : "";
    var frequencyClause = (this.get('frequency') && this.get('frequency').length > 0) ? "a.frequency <= " + this.get('frequency') : "";
    var pathogenicityClause = this.get('pathogenicity') ? "  AND a.clinicalsignificance LIKE '%Pathogenic%'" : "";
    var clauses = [samplesClause, variantClause, genesClause, rsidClause, frequencyClause, pathogenicityClause].filter(v => v).join(" AND ");
return "WITH" +
" v AS (" +
"  SELECT" +
"  sampleid," +
"  REPLACE(contigname, 'chr', '') as chromosome," +
"  start as startposition," +
"  \"end\" as endposition," +
"  variant.referenceallele," +
"  variant.alternateallele," +
"  alleles[1] as genotype0," +
"  alleles[2] as genotype1" +
" FROM variants" +
" )," +
" a AS (" +
"  SELECT" +
"  contigname as chromosome," +
"  start as startposition," +
"  \"end\" as endposition," +
"  referenceallele," +
"  alternateallele," +
"  annotation.attributes['RS'] as rsid," +
"  annotation.attributes['CLINSIG'] as clinicalsignificance," +
"  SPLIT(annotation.attributes['GENEINFO'], ':')[1] as genesymbol," +
"  annotation.attributes['CLNDISDB'] as phenotypelist," +
"  annotation.attributes['AF_EXAC'] as frequency" +
" FROM annotations" +
" )" +
"SELECT" +
"  v.sampleid," +
"  v.chromosome," +
"  v.startposition," +
"  v.endposition," +
"  v.referenceallele," +
"  v.alternateallele," +
"  v.genotype0," +
"  v.genotype1," +
"  a.rsid," +
"  a.clinicalsignificance," +
"  a.genesymbol," +
"  a.phenotypelist," +
"  a.frequency" +
" FROM v" +
" JOIN a" +
"  ON v.chromosome = a.chromosome" +
"  AND v.startposition = a.startposition" +
"  AND v.endposition = a.endposition" +
"  AND v.referenceallele = a.referenceallele" +
"  AND v.alternateallele = a.alternateallele" +
" WHERE " +
clauses +
" LIMIT 50";
  })
});
