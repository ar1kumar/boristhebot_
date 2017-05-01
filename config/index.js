var path = require('path');
var fs = require('fs');
var root=  path.normalize(__dirname + './../../../');

// var key = fs.readFileSync(root+'/config/keys/keyfile.key')
// var cert = fs.readFileSync(root+'/config/keys/crtfile.crt')

var config = {

    host : '127.0.0.1',

    port : 80,

    https_port : 443,

    https_options : {
  		//key: key,
  		//cert:cert,
  		requestCert: true,
  		rejectUnauthorized: false
    },
    mongo : {
        uri : 'mongodb://localhost/borisdb'
    }
};

module.exports = config;
