<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require './vendor/autoload.php';
// spl_autoload_register(function ($classname) {
//     require ("../classes/" . $classname . ".php");
// });

$config['displayErrorDetails'] = true;

$config['db']['host']   = "localhost";
$config['db']['port'] = '3306';
$config['db']['user']   = "vineel";
$config['db']['pass']   = "fuckme";
$config['db']['dbname'] = "family_photo";

 // header("Access-Control-Allow-Origin: *");

$app = new \Slim\App(["settings" => $config]);
$container = $app->getContainer();

$container['logger'] = function($c) {
	$logger = new \Monolog\Logger('my_logger');
	$file_handler = new \Monolog\Handler\StreamHandler("../logs/app.log");
	$logger->pushHandler($file_handler);
	return $logger;
};
$container['logger']->addInfo("Starting up...");

$container['db'] = function ($c) {
	$db = $c['settings']['db'];
	$pdo = new PDO("mysql:host=" . $db['host'] . ";dbname=" . $db['dbname'] . ";port=" . $db['port'], $db['user'], $db['pass']);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	return $pdo;
};

require "api/api_family.php";


$app->post('/upload', function(Request $request, Response $response) {
	print("check 1");
	$email = $request->getParam('email');
	$sql = "select * from account where email=:email";
	$stmt = $this->db->prepare($sql);
	$stmt->execute(array("email"=>$email));
	$account = $stmt->fetch();
	$familyId = $account['family_id'];
	$accountId = $account['account_id'];

	print_r($_FILES);
	$target_dir = '../photos/';
	// $target_file = $target_dir . basename($_FILES['user_photo']['tmp_name']);
	// $this->logger->addInfo("target file:" . $target_file);

	// $imageFileType = pathinfo($target_file,PATHINFO_EXTE

	if ( $request->getParam('submit') != null ) {
		$check = getimagesize($_FILES['user_photo']['tmp_name']);
		$width = $check[0];
		$height = $check[1];
		$this->logger->addInfo(json_encode($check));
		
		$this->logger->addInfo("successful upload: " . $_FILES['user_photo']['tmp_name']);
		$newName = time() . ".jpg";
		$success=move_uploaded_file($_FILES["user_photo"]["tmp_name"],  $target_dir . $newName);
		$this->logger->addInfo("added to $success");

		$params = array (
			"asset_type" => "photo",
			"title" => "Family Photo",
			"url" => $newName,
			"family_id" => $familyId,
			"uploader_account_id" => $accountId,
			"pipeline_stage" => "uploaded",
			"created_at" => date("Y-m-d H:i:s"),
			"uploaded_at" => date("Y-m-d H:i:s"),
			"width" => $width,
			"height" => $height
		);

		$sql = "insert into asset ( asset_type, title, url, family_id, uploader_account_id, pipeline_stage, created_at, uploaded_at, width, height) ";
		$sql .= "values ( :asset_type, :title, :url, :family_id, :uploader_account_id, :pipeline_stage, :created_at, :uploaded_at, :width, :height )";
		$stmt = $this->db->prepare($sql);
		$stmt->execute($params);
	}
});

$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $response->getBody()->write("Hello, $name");
    $this->logger->addInfo('using this pointer to access logger');
    return $response;
});

$app->get('/slideshow', function (Request $request, Response $response) {
	$email = $request->getParam('email');
	$startDate = $request->getParam('day');

	// find account by email
	$sql = "select a.*, f.*  from account a, family f where f.family_id=a.account_id and a.email=?";
	$stmt = $this->db->prepare($sql);
	$stmt->bindParam(1, $email);
	$account = null;
	if ($stmt->execute()) {
		$account = $stmt->fetch();
	}
	// print_r($account);

	// grab family id from account
	$familyId = $account['family_id'];

	// grab family names
	$sql = "select * from family where family_id in (select dst_family_id from family_has_family where src_family_id=? union select ?)";
	$stmt = $this->db->prepare($sql);
	$stmt->bindParam(1, $familyId);
	$stmt->bindParam(2, $familyId);
	$families = array();
	if ($stmt->execute()) {
		while ($row = $stmt->fetch()) {
			$families[]=$row;
		}
	}

	// get photos from families that I view using familyId and slideshow date
	$sql =   "select r.dst_family_id as view_family_id, f.*, a.* from  family_has_family r, family f, asset a where r.src_family_id=? and f.family_id=r.dst_family_id and a.family_id=r.dst_family_id ";
	$sql = $sql . "and created_at > date('" . $startDate . "') and created_at < date_add('" . $startDate . "', interval 1 day) ";
	$sql = $sql . " order by asset_id";

	$this->logger->addInfo($sql);
	$stmt = $this->db->prepare($sql);
	$stmt->bindParam(1, $familyId);
	$assets = [];
	if ($stmt->execute()) {
		while ($row = $stmt->fetch()) {
			$assets []=  $row;
		}
	}

	// get photos from my family using family id and date
	$sql = "select a.*, f.* from asset a, family f where a.family_id=? and f.family_id=a.family_id ";
	$sql = $sql . "and created_at > date('" . $startDate . "') and created_at < date_add('" . $startDate . "', interval 1 day) ";
	$sql = $sql . " order by asset_id";

	$this->logger->addInfo($sql);
	$stmt = $this->db->prepare($sql);
	$stmt->bindParam(1, $familyId);
	if ($stmt->execute()) {
		while ($row = $stmt->fetch()) {
			$assets []=  $row;
		}
	}

	$result = array(
		'account' => $account,
		'families' => $families,
		'assets' => $assets
	);

	$response->getBody()->write(json_encode($result, JSON_PRETTY_PRINT));

	return $response;
});

$app->get('/account', function (Request $request, Response $response) {
	$sql = "select * from account where email=?";
	$stmt = $this->db->prepare($sql);
	$this->logger->error("email=" . $request->getParam('email'));
	$email =  $request->getParam('email') ? $request->getParam('email') : 'vineel@vineel.com';
	$stmt->bindParam(1, $email);
	$rows = [];
	if ($stmt->execute()) {
		while ($row = $stmt->fetch()) {
			$rows[]=$row;
		}
		$this->logger->addInfo('execute wait and see');
 	} else {
		$this->logger->addInfo('execute failed');
	}
	$response->getBody()->write(json_encode($rows, JSON_PRETTY_PRINT));

	return $response;
});


$app->run();
