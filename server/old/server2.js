var express =   require("express");
var multer  =   require('multer');
var Sequelize = require('sequelize');
var mysql   =   require('mysql')
var bodyParser = require('body-parser');
var app         =   express();

//// SET UP MIDDLEWARE ////
    // set up sequelize ORM
var db = new Sequelize('mysql://vineel:fuckme@127.0.0.1:3307/family_photo');
    // to decode url-encoded bodies (from normal POSTs)
app.use(bodyParser.urlencoded({ extended: true })); 

// returns a promise of accountInfoJSON
var getAccountInfo = function(email) {
    return db.query("select * from account a where a.email=?", {replacements: [email], type: db.QueryTypes.SELECT});
};


//// SET UP ORM MODELS
var Asset = db.define('asset', {
    asset_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    asset_type: Sequelize.STRING,
    title: Sequelize.STRING,
    url: Sequelize.STRING,
    size1_url: Sequelize.STRING,
    size2_url: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
}, { tableName: 'Asset' });

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
        // res.end("---------------------------------------------------------------------------\nFile is uploaded\n");
        // console.log("upload res:", res);
        // console.log("upload req:", req);
        console.log("filename out:", req.file.filename);
        console.log("req.body", req.body.user_email);

        getAccountInfo(req.body.user_email)
        .then(function(jresponse) {
            console.log(jresponse);
            Asset.create({
                asset_type: 'photo',
                title: 'Family Photo',
                url: req.file.filename,
                created_at: new Date(),
                updated_at: new Date()
            }).then(function(asset) {
                console.log("newly created asset\n", asset);
            });
            res.send({success: true})
            // var ROWS= db.query("insert into asset (asset_type, title, url) values (?,?,?)",{replacements: ['photo', 'Family Photo', req.file.filename], type:db.QueryTypes.INSERT})
                
            // console.log("rows=",row)
                // .spread(function (results, metadata) {
                //     console.log("spread:", results, metadata);
                // }).error(function(err) {
                //     console.log(err);
                // });
        })
    });
});


///////// API /////////////////////////////////////

app.get('/',function(req,res){
    console.log("index.html");
    res.sendFile(__dirname + "/index.html");
});

// GET DB
var dbconn = mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "vineel",
  password: "fuckme",
  database: "family_photo"
});

dbconn.connect(function(err){ console.log("connect..."); });

app.get('/accounts', function(request, response) {
  console.log("accounts...");
  dbconn.query('SELECT * FROM `account`', function (error, results, fields) {
    // console.log("results", results);
    response.send(results);
});
});

app.listen(3000,function(){
    console.log("Working on port 3000...\n");
});