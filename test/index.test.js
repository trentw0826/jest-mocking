const CatFact = require('../index')

test('Empty CatFact', () => {
  const obj = new CatFact();

  expect(obj.facts.length).toBe(0);
  expect(obj.history().length).toBe(0);
});