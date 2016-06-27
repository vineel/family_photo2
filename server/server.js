var express     = require("express");
var multer      = require('multer');
var mysql     = require('promise-mysql');
var bodyParser  = require('body-parser');
var app         = express();


//// SET UP MIDDLEWARE ////

    app.use('/photos', express.static('uploads'));
    
    app.use(express.static('public'));

    app.use(bodyParser.urlencoded({ extended: true }));  // to decode url-encoded bodies (from normal POSTs)

    var DB = function() {
	console.log("DB");
        return mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'vineel',
            password: 'fuckme',
            database: 'family_photo'
        }).then(function(conn) {
            console.log("db is connected: ", conn);
            return conn;
        });        
    };


//////// UPLOAD ////////////////////////////

    // hooks to tie into upload lifecycle
    var storage =   multer.diskStorage({
        destination: function (req, file, callback) {
            console.log("destination uploads");
            callback(null, './uploads');
        },
        filename: function (req, file, callback) {
            console.log("filename");
            callback(null, file.fieldname + '-' + Date.now() + ".jpg");
        }
    });

    var upload = multer({ storage : storage }).single('user_photo');

    app.post('/photo',function(req,res){
        console.log("post photo");
        var accountEmail = req.body.user_email;
        upload(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.\n");
            }

            DB().then(function(db) {
                var familyId = null;
                var accountId = null;

		console.log("check 1");
                db.query({ sql: 'select * from account where email=?' },[req.body.user_email])
                .then(function(rows) {
		    console.log("check 1");
                    familyId = rows[0].family_id;
                    accountId = rows[0].account_id;
                    return
                }).then(function() {
		    console.log("check 1");
                    return db.query(
                        'insert into asset set ?', 
                        { 
                            asset_type:'photo', 
                            title: 'Family Photo', 
                            url: req.file.filename,
                            family_id: familyId,
                            uploader_account_id: accountId,
                            pipeline_stage: 'uploaded',
                            created_at: new Date(), 
                            uploaded_at: new Date(),
                            width: req.body.width,
                            height: req.body.height
                        }
                    )                   
                }).then(function(result) {
		    console.log("check 1");
                    res.send('ok,' + result.insertId);    
                });
            });
        });
    });


///////// API /////////////////////////////////////

    app.get('/', function(req, res) {
        res.send('ok');
    });

    app.get('/hello', function(req, res) {
        res.send('hello');
    });

    app.get('/accounts', function(req, res) {
        DB().then(function(db) {
            return db.query('select * from account')
        })
        .then(function(rows) {
            res.send(rows);
        });
    });

    // http://localhost:3000/show.json?email=vineel@vineel.com&day=2016-05-06
    app.get('/slideshow.json', function(req, res) {
        var email = req.query.email;
        var startDate = req.query.day;

    	// console.log("email=", email);

        DB().then(function(db) {
            var acct;
            var assets = [];

            // 1. get account and family
            var sql = "select a.*, f.*  from account a, family f where f.family_id=a.account_id and a.email=?";
            db.query(sql, [email])
            .then(function(rows) {
                acct = rows[0];

                // get photos from families that I view
                console.log("src_family_id=", [acct['family_id']]);
                sql =   "select r.dst_family_id as view_family_id, f.*, a.* from  family_has_family r, family f, asset a where r.src_family_id=? and f.family_id=r.dst_family_id and a.family_id=r.dst_family_id ";
                sql += "and created_at > date('" + startDate + "') and created_at < date_add('" + startDate + "', interval 1 day) ";
                sql += "order by asset_id";
                console.log("sql:",sql);
                return db.query(sql, [acct['family_id']]);

            }).then(function(rows) {
                assets = rows;
                console.log("get my viewed family photos:", JSON.stringify(rows, null, 2));

                // get photos of my family, put them at the end
                sql = "select a.*, f.* from asset a, family f where a.family_id=? and f.family_id=a.family_id";
                return db.query(sql, [acct['family_id']]);

            }).then(function(rows) {
                rows.forEach(function (row, index) {
                    assets.push(row);
                    console.log("add my row:", row);
                });

                res.send({
                    "account": acct,
                    "assets": assets
                });
            });
        });
    });

app.get('/demo.json', function(req, res) {
        var email = req.query.email || 'v@vineel.com';
        console.log("email=", email);

        DB().then(function(db) {
            var acct;
            var assets = [];

            // 1. get account and family
            var sql = "select a.*, f.*  from account a, family f where f.family_id=a.account_id and a.email=?";
            db.query(sql, [email])
            .then(function(rows) {
                acct = rows[0];

                // get photos from families that I view
                // sql = "select r.dst_family_id as view_family_id, a.* from family_has_family r, asset a where r.src_family_id=? and a.family_id=r.dst_family_id order by asset_id";
                sql = "select r.dst_family_id as view_family_id, f.*, a.* from  family_has_family r, family f, asset a where r.src_family_id=? and f.family_id=r.dst_family_id and a.family_id=r.dst_family_id order by asset_id";
                return db.query(sql, [acct['family_id']]);

            }).then(function(rows) {
                assets = rows;

                // get photos of my family, put them at the end
                sql = "select a.*, f.* from asset a, family f where a.family_id=? and f.family_id=a.family_id";
                return db.query(sql, [acct['family_id']]);

            }).then(function(rows) {
                rows.forEach(function (row, index) {
                    assets.push(row);
                });

                res.send({
                    "account": acct,
                    "assets": assets
                });
            });
        });
    });
    
app.listen(3000,function(){
    console.log("Working on port 3000...\n");
});
