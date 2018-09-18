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
    var samplesClause = (this.get('samples') && this.get('samples').length > 0) ? "  AND v.sampleid IN ('" + this.get('samples').replace(/ /g,'').split(',').join("','") + "')" : "";
    var variantClause = (this.get('variant') && this.get('variant').length > 0 && this.get('variant').split('-').length == 5) ? "  AND v.chromosome = '" + this.get('variant').split('-')[0] + "'" + " AND v.startposition = " + this.get('variant').split('-')[1] + " AND v.endposition = " + this.get('variant').split('-')[2] + " AND v.referenceallele = '" + this.get('variant').split('-')[3] + "'" + " AND v.alternateallele = '" + this.get('variant').split('-')[4] + "'" : "";
    var genesClause = (this.get('genes') && this.get('genes').length > 0) ? "  AND a.genesymbol IN ('" + this.get('genes').replace(/ /g,'').split(',').join("','") + "')" : "";
    var rsidClause = (this.get('rsid') && this.get('rsid').length > 0) ? "  AND a.rsid = '" + this.get('rsid') + "'" : "";
    var frequencyClause = (this.get('frequency') && this.get('frequency').length > 0) ? "  AND f.frequency <= " + this.get('frequency') : "";
    var pathogenicityClause = this.get('pathogenicity') ? "  AND a.clinicalsignificance LIKE '%Pathogenic%'" : "";
return "SELECT" +
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
"  f.frequency" +
" FROM variants v" +
" JOIN annotations a" +
"  ON v.chromosome = a.chromosome" +
"  AND v.startposition = a.startposition - 1" +
"  AND v.endposition = a.endposition" +
"  AND v.referenceallele = a.referenceallele" +
"  AND v.alternateallele = a.alternateallele" +
" JOIN variant_frequencies f" +
"  ON v.chromosome = f.chromosome" +
"  AND v.startposition = f.startposition" +
"  AND v.endposition = f.endposition" +
"  AND v.referenceallele = f.referenceallele" +
"  AND v.alternateallele = f.alternateallele" +
" WHERE" +
"  assembly='GRCh37'" +
"  AND a.clinsigsimple='1'" +
samplesClause +
variantClause +
genesClause +
rsidClause +
frequencyClause +
pathogenicityClause +
// " ORDER BY f.frequency DESC" +
" LIMIT 50";
  })
});
