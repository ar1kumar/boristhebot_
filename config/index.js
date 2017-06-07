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
        uri : 'mongodb://boris:IAmInvincible@localhost/borisdb'
    },
    fb_tokens : {
      accessToken: 'EAAI9d9b5LeUBAN5US8DOwXhqYxp1BMrBJXYvbZCtBg29yQBb10qg4VP8CWQv7ztfT2tYyUiQYU1EX2cfFk2cdoW1OoGHvrHkGkpD3DsNjk13NeOBmu2iLUiG4GPuvofL6JtMNaYFcRzsxtd7XNziBJf6UVsWZB0FL4V1GK9AZDZD',
      verifyToken: 'wubba_lubba_dub_dub',
      appSecret: '7173ea6fd3343358fed188cef1f23224',
      //broadcastEchoes : true
    },
    google : {
      api_key: "AIzaSyAgKpKDrZhiv-qyJ-kW_hObLQZBZLExcns"
    },
    weather : {
      api_key: "c9c5e0fd30ab9c5721abdfcab8a356e7"
    }
};

module.exports = config;
