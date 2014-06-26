function Steady(opts) {
  if ( !opts ) throw new Error('missing options');
  if ( !opts.handler ) throw new Error('missing handler parameter');


  this.scrollElement = opts.scrollElement || window;
  this.conditions = opts.conditions || {};
  this.handler   = opts.handler;
  this.values    = {};
  this.tracked   = {};
  this.success   = false;
  this.throttleVal = opts.throttle || 100;
  this.processing = false;
  this.stopped = false;


  this._parse();

  if ( 'pageYOffset' in this.scrollElement ) {
    this._addBottom();
    this._addTop();
  } else {
    this._addBottomEl();
    this._addTopEl();
    this._addScrollLeft();
  }

  this._addWidth();
  this._onScroll();

}


Steady.prototype.addCondition = function(name, value) {
  this.conditions[name] = value;
  this._parse();
};
Steady.prototype.removeCondition = function(name) {
  delete this.conditions[name];
  this._parse();
};
Steady.prototype.addTracker  = function(name, fn) {
  this.tracked[name] = { cb: fn, name: name};
};

Steady.prototype._addBottom = function() {
  this.addTracker('bottom', function(scrollable) {
    var height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    return height - (scrollable.pageYOffset + scrollable.innerHeight);
  });
};

Steady.prototype._addTop = function() {
  this.addTracker('top', function(scrollable) {
    return scrollable.pageYOffset;
  });
};

Steady.prototype._addBottomEl = function() {
  var self = this;
  this.addTracker('bottom', function(scrollable) {
    var height = Math.max(
      scrollable.scrollHeight,
      scrollable.offsetHeight
    );
    return height - ( scrollable.scrollTop + scrollable.offsetHeight);
  });
};

Steady.prototype._addTopEl = function() {
  this.addTracker('top', function(scrollable) {
    return scrollable.scrollTop;
  });
};

Steady.prototype._addScrollLeft = function() {
  var self = this;
  this.addTracker('scrollLeft', function(scrollable) {
    return scrollable.scrollLeft;
  });
};

Steady.prototype._addWidth = function() {
  this.addTracker('width', function(scrollable) {
    return scrollable.innerWidth;
  });
};


Steady.prototype._parse = function() {
  this._parsed = {};
  this._wantedTrackers = [];
  this._parsedMax = {};
  this._parsedMin = {};

  for ( var condition in this.conditions ) {
    if( !this.conditions.hasOwnProperty(condition) ) continue;
    
    var operator = condition.substr(0, 4);

    switch(operator) {
      case 'min-':
        this._wantedTrackers.push(condition.substr(4, condition.length));
        this._parsedMin[condition.substr(4, condition.length)] = this.conditions[condition];
        break;
      case 'max-':
        this._wantedTrackers.push(condition.substr(4, condition.length));
        this._parsedMax[condition.substr(4, condition.length)] = this.conditions[condition];
        break;
      default:
        this._wantedTrackers.push(condition);
        this._parsed[condition] = this.conditions[condition];
    }

  }
};

Steady.prototype._check = function() {
  var results = [];
  
  for( var name in this.values ) {
    if ( this._parsed.hasOwnProperty(name) ) {
      results.push( this._parsed[name] == this.values[name] );
    }
    if ( this._parsedMin.hasOwnProperty(name) ) {
      results.push( this._parsedMin[name] <= this.values[name] ); 
    }

    if ( this._parsedMax.hasOwnProperty(name) ) {
      results.push( this._parsedMax[name] >= this.values[name] );
    }
  }

  if ( results.length && results.indexOf(false) == -1 ) {
    this.processing = true;

    var cb = this._done.bind(this);
    window.requestAnimationFrame(this.handler.bind(this, this.values, cb));
  }
};

Steady.prototype._done = function() {
  this.processing = false;
};

Steady.prototype._onScroll = function() {
  this._onScrollHandler = this._throttledHandler();
  this.scrollElement.addEventListener('scroll', this._onScrollHandler, false);
};

Steady.prototype._throttledHandler = function() {
  var self = this;
  return this.throttle(function(e) {

    if ( !self._wantedTrackers.length || self.processing ) return;
    
    for (var i = 0; i < self._wantedTrackers.length; i++) {

      if ( !self.tracked[self._wantedTrackers[i]] ) continue;

      self.values[self._wantedTrackers[i]] = self.tracked[self._wantedTrackers[i]].cb(self.scrollElement || window);
    }
    
    window.requestAnimationFrame(self._check.bind(self));
  }, this.throttleVal);
};

Steady.prototype.stop = function() {
  if ( ! this.stopped  ) {
    this.scrollElement.removeEventListener('scroll', this._onScrollHandler, false);
    this.stopped = true;
  }
};

Steady.prototype.resume = function() {
  if ( this.stopped  ) 
    this._onScroll();
    this.stopped = false;
};


// i use it to avoid calling the onscroll function many times.
Steady.prototype.throttle = function(fn, delay) {
  var timer;

  return function () {
    var context = this;
    var args = arguments;

    if ( timer ) return;

    timer = true;
    setTimeout(function () {
      fn.apply(context, args);
      timer = false;
    }, delay);
  };
};


if (typeof module === 'object' && module.exports) {
  module.exports = Steady;
}