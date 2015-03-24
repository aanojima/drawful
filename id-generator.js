var crypto = require('crypto');
var app = require('./app.js');

exports.generateId = function(){
  var id;
  while(!id || app.games.hasOwnProperty(id)){
    id = randomAsciiString(5);
  }
  return id;
}

var randomAsciiString = function(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
  if(!chars) {
      throw new Error('Argument \'chars\' is undefined');
  }

  var charsLength = chars.length;
  if(charsLength > 256) {
      throw new Error('Argument \'chars\' should not have more than 256 characters'
          + ', otherwise unpredictability will be broken');
  }

  var randomBytes = crypto.randomBytes(length)
  var result = new Array(length);

  var cursor = 0;
  for (var i = 0; i < length; i++) {
      cursor += randomBytes[i];
      result[i] = chars[cursor % charsLength]
  };

  return result.join('');
}