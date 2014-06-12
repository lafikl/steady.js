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


  this._parse();

  if ( this.scrollElement.hasOwnProperty('scrollY') ) {
    this._addBottom();
    this._addScrollX();
    this._addScrollY();
  } else {
    this._addBottomEl();
    this._addScrollTop();
    this._addScrollLeft();
  }

  this._addWidth();
  this._onScroll();

}


Steady.prototype.addCondition = function(name, value) {
  this.conditions[name] = value;
  this._parse();
};
Steady.prototype.addTracker  = function(name, fn) {
  this.tracked[name] = { cb: fn, name: name};
};

Steady.prototype._addScrollX = function() {
  this.addTracker('scrollX', function(window) {
    return window.scrollX;
  });
};
Steady.prototype._addScrollY = function() {
  this.addTracker('scrollY', function(window) {
    return window.scrollY;
  });
};

Steady.prototype._addBottom = function() {
  this.addTracker('bottom', function(window) {
    var height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    return height - (window.scrollY + window.innerHeight);
  });
};

Steady.prototype._addBottomEl = function() {
  var self = this;
  this.addTracker('bottom', function(window) {
    var height = Math.max(
      self.scrollElement.scrollHeight,
      self.scrollElement.offsetHeight
    );
    return height - ( self.scrollElement.scrollTop + self.scrollElement.offsetHeight);
  });
};

Steady.prototype._addScrollTop = function() {
  var self = this;
  this.addTracker('scrollTop', function(window) {
    return self.scrollElement.scrollTop;
  });
};

Steady.prototype._addScrollLeft = function() {
  var self = this;
  this.addTracker('scrollLeft', function(window) {
    return self.scrollElement.scrollLeft;
  });
};

Steady.prototype._addWidth = function() {
  this.addTracker('width', function(window) {
    return window.innerWidth;
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
  var self = this;
  

  this.scrollElement.onscroll = this.throttle(function(e) {

    if ( !self._wantedTrackers.length || self.processing ) return;
    
    for (var i = 0; i < self._wantedTrackers.length; i++) {

      if ( !self.tracked[self._wantedTrackers[i]] ) continue;

      self.values[self._wantedTrackers[i]] = self.tracked[self._wantedTrackers[i]].cb(window);
    }
    
    window.requestAnimationFrame(self._check.bind(self));
  }, this.throttleVal);

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