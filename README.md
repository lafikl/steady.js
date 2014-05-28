Steady.js
=========

A module to do some logic on the `onscroll` event without performance regressions in a @media-query like conditions.



# Why Steady.js ?
I wrote Steady.js after seeing a lot of coders abuse `onscroll` which is ruined my browsing experience many times.




# Features
- Tiny `onscroll` handler, that collect values only offloading the computations to `requestAnimationFrame`
- Throttling `onscroll` handler to avoid calling it more than what we need.
- Simple and reusable trackers that works like `@media-query`
- Built-in trackers: 
    -  `bottom`: 
    -  `scrollY`:
    -  `scrollX`:
    -  `width`:
- Extendable trackers, you can simply roll your own trackers.


# Use cases examples
- Lazy loader for images or content
- Infinite scroll
- Changing the layout based on your scroll position ( sticky headers ).
- ...and anything that requires listening on the `onscroll` event.

# Usage: Steady(options)

### Basic
```javascript
var steady = new Steady({
    conditions: {
        'max-scrollY': 500,
        'min-scrollY': 50,
        'scrollX': 0
    },
    throttle: 100, // optional, 
    handler: function(values, done) {
      console.log(values);
      
      // when are done we call done!
      done();
    }
});
```

### Add Tracker
```javascript
var s = new Steady({
  throttle: 100,
  handler: fn
});

s.addTracker('#head-top', function(window) {
  var rect = document.getElementById('head').getBoundingClientRect();
  return rect.top;
});


s.addCondition('min-#head-top', 0);
s.addCondition('max-#head-top', 200);

function fn(values, done) {
  console.log(values);

  var head = document.getElementById('head');
  var color = head.style.color;
  if ( color !== 'red' ) head.style.color = 'red';
  done();
}
```


# Installation

### NPM
```
npm install steady
```

### Component
```
component install lafikl/steady
```


_____


# Author
Khalid Lafi ([@lafikl](http://twitter.com/lafikl))

