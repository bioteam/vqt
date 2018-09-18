import DS from 'ember-data';

export default DS.Model.extend({
  samples: DS.attr('string'),
  variant: DS.attr('string'),
  genes: DS.attr('string'),
  rsid: DS.attr('string'),
  frequency: DS.attr('number'),
  zygosity: DS.attr('string'),
  pathogenicity: DS.attr('string'),
  query: DS.attr('string')
});
