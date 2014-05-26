var s = new Steady({
  conditions: {
    'scrollX': 0,
    'max-scrollY': 20
  },
  handler: fn
});


function fn(values) {
  console.log(values);
}