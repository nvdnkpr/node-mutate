// Generated by CoffeeScript 1.6.3
var Generator, stream, util;

stream = require('stream');

util = require('util');

/*

`generator([options])`: Generate random CSV data
================================================

This function is provided for conveniency in case you need to generate random CSV data.

Note, it is quite simple at the moment, more functionnalities could come later. The code 
originates from "./samples/perf.coffee" and was later extracted in case other persons need 
its functionnalities.

Options may include

*   `duration`   
    Period to run in milliseconds, default to 4 minutes.
*   `headers`   
    Define the number of generated fields and the generation 
    method. If headers is an integer, it corresponds to the 
    number of fields. If it is an array, each element correspond 
    to a field. If the element is a function, the function will generate
    the field value, if it is a string, it call the registered 
    function of the same name (see `Generator[name]`.
*   `max_word_length`   
    Maximum number of characters per word
*   `seed`   
    Generate idempotent random characters if a number provided
*   `length`   
    Number of line to read

Starting a generation

    csv = require 'csv'
    generator = csv.generator
    generator().pipe csv().to.path "#{__dirname}/perf.out"
*/


Generator = function(options) {
  var i, v, _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _i, _len, _ref;
  this.options = options != null ? options : {};
  stream.Readable.call(this, this.options);
  if ((_base = this.options).duration == null) {
    _base.duration = 4 * 60 * 1000;
  }
  if ((_base1 = this.options).headers == null) {
    _base1.headers = 8;
  }
  if ((_base2 = this.options).max_word_length == null) {
    _base2.max_word_length = 16;
  }
  if ((_base3 = this.options).fixed_size == null) {
    _base3.fixed_size = false;
  }
  if ((_base4 = this.options).fixed_size_buffer == null) {
    _base4.fixed_size_buffer = '';
  }
  if ((_base5 = this.options).start == null) {
    _base5.start = Date.now();
  }
  if ((_base6 = this.options).end == null) {
    _base6.end = null;
  }
  if ((_base7 = this.options).seed == null) {
    _base7.seed = false;
  }
  if ((_base8 = this.options).length == null) {
    _base8.length = -1;
  }
  this.count = 0;
  if (typeof this.options.headers === 'number') {
    this.options.headers = new Array(this.options.headers);
  }
  _ref = this.options.headers;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    v = _ref[i];
    if (v == null) {
      v = 'ascii';
    }
    if (typeof v === 'string') {
      this.options.headers[i] = Generator[v];
    }
  }
  return this;
};

util.inherits(Generator, stream.Readable);

Generator.prototype.random = function() {
  if (this.options.seed) {
    return this.options.seed = this.options.seed * Math.PI * 100 % 100 / 100;
  } else {
    return Math.random();
  }
};

Generator.prototype.end = function() {
  return this.push(null);
};

Generator.prototype._read = function(size) {
  var column, data, header, length, line, lineLength, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
  data = [];
  length = this.options.fixed_size_buffer.length;
  if (length) {
    data.push(this.options.fixed_size_buffer);
  }
  while (true) {
    if ((this.count++ === this.options.length) || (this.options.end && Date.now() > this.options.end)) {
      if (data.length) {
        if (this.options.objectMode) {
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            line = data[_i];
            this.push(line);
          }
        } else {
          this.push(data.join(''));
        }
      }
      return this.push(null);
    }
    line = [];
    _ref = this.options.headers;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      header = _ref[_j];
      line.push("" + (header(this)));
    }
    if (this.options.objectMode) {
      lineLength = 0;
      for (_k = 0, _len2 = line.length; _k < _len2; _k++) {
        column = line[_k];
        lineLength += column.length;
      }
    } else {
      line = "" + (this.count === 1 ? '' : '\n') + (line.join(','));
      lineLength = line.length;
    }
    if (length + lineLength > size) {
      if (this.options.objectMode) {
        data.push(line);
        for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
          line = data[_l];
          this.push(line);
        }
      } else {
        if (this.options.fixed_size) {
          this.options.fixed_size_buffer = line.substr(size - length);
          data.push(line.substr(0, size - length));
        } else {
          data.push(line);
        }
        this.push(data.join(''));
      }
      break;
    }
    length += lineLength;
    data.push(line);
  }
};

Generator.ascii = function(gen) {
  var char, column, nb_chars, _i, _ref;
  column = [];
  for (nb_chars = _i = 0, _ref = Math.ceil(gen.random() * gen.options.max_word_length); 0 <= _ref ? _i < _ref : _i > _ref; nb_chars = 0 <= _ref ? ++_i : --_i) {
    char = Math.floor(gen.random() * 32);
    column.push(String.fromCharCode(char + (char < 16 ? 65 : 97 - 16)));
  }
  return column.join('');
};

Generator.int = function(gen) {
  return Math.floor(gen.random() * Math.pow(2, 52));
};

Generator.bool = function(gen) {
  return Math.floor(gen.random() * 2);
};

module.exports = function(options) {
  return new Generator(options);
};

module.exports.Generator = Generator;
