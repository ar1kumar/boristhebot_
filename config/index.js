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
    bot_port : 3000,
    mongo : {
        uri : 'mongodb://localhost/borisdb'
    },
    fb_tokens : {
      accessToken: 'EAAI9d9b5LeUBAEjxv0ftogGXEu8VRM85bPFvaWSXujExMZCQHQH5pBcZCPbmjba0iEgVLrJcDNOhq6FkC6VUtMEfjeDZBJwiQAZCAjABnPK1YvKmPV5tdIXPZCIKUgDPio3Y41EyLZBm2bN4tXrrmWhYmoLUXKl9Q4hBKZCQdf7pAZDZD',
      verifyToken: 'wubba_lubba_dub_dub',
      appSecret: '7173ea6fd3343358fed188cef1f23224'
    }
};

module.exports = config;
