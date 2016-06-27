var mysql     = require('promise-mysql');
var imageSizer = require('image-size');

  var DB = function() {
        return mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'vineel',
            password: 'fuckme',
            database: 'family_photo'
        }).then(function(conn) {
            // console.log("db is connected: ", conn);
            return conn;
        });        
    };


    DB.then(function(db) {
    	 db.query({ sql: 'select * from asset where width is null' })
    	 .then(function(rows) {
    	 	
    	 })
    })