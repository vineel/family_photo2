<?php
	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;

	require '../../../vendor/autoload.php';

	$config = array();
	$config['db'] = array();
	$config['db']['host']   = "localhost";
	$config['db']['port'] = '3306';
	$config['db']['user']   = "vineel";
	$config['db']['pass']   = "fuckme";
	$config['db']['dbname'] = "family_photo";

	$logger = new \Monolog\Logger('my_logger');
	$file_handler = new \Monolog\Handler\StreamHandler("../logs/app.log");
	$logger->pushHandler($file_handler);

	$logger->addInfo('this is the script.');

	$db = $config['db'];
	$pdo = new PDO("mysql:host=" . $db['host'] . ";dbname=" . $db['dbname'] . ";port=" . $db['port'], $db['user'], $db['pass']);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	


	function doQuery($sql, $params = array()) {
		global $pdo;

		$stmt = $pdo->prepare($sql);
		$rows = array();
		if ($stmt->execute($params)) {
			while ($row = $stmt->fetch()) {
				$rows []= $row;
			}
		}
		return $rows;
	}

	function doUpdate($sql, $params = array()) {
		global $pdo;

		print("sql=$sql\n");
		print_r($params);
		$stmt = $pdo->prepare($sql);
		$index =  0;
		foreach ($params as $p) {
			$index += 1;
			$stmt->bindValue($index, $p);
		}
		$stmt->execute();
		print ("-----------------------\n");
	}

	function doUpdateNamedParams($sql, $params = array()) {
		global $pdo;

		print("sql=$sql\n");
		print_r($params);
		$stmt = $pdo->prepare($sql);
		$index =  0;
		foreach ($params as $k => $v)  {
			$index += 1;
			$key = ":$k";
			$stmt->bindValue($key,$v);
		}
		$stmt->execute();
		print ("-----------------------\n");
	}

	function imagecreatefromfile( $filename ) {
		if (!file_exists($filename)) {
			throw new InvalidArgumentException('File "'.$filename.'" not found.');
		}
		switch ( strtolower( pathinfo( $filename, PATHINFO_EXTENSION ))) {
			case 'jpeg':
			case 'jpg':
			    return imagecreatefromjpeg($filename);
			break;

			case 'png':
			    return imagecreatefrompng($filename);
			break;

			case 'gif':
			    return imagecreatefromgif($filename);
			break;

			default:
			    throw new InvalidArgumentException('File "'.$filename.'" is not valid jpg, png or gif image.');
			break;
		}
	}

	function scaleImage($srcUrl, $dstFile, $boxW, $boxH) {
		print("writing thumbnail $srcUrl to $dstFile");
		list($width, $height, $type, $attr) = getimagesize($srcUrl);
		$orig = imagecreatefromfile($srcUrl);
		print("width=$width, height=$height\n");

		$scale =  1.0;
		$scaleW = $boxW / $width;
		$scaleH = $boxH / $height;
		$orientation = '';
		if ($scaleW < $scaleH ) {
			$scale = $scaleW;
			$orientation = 'h';
		} else {
			$scale = $scaleH;
			$orientation = 'v';
		}

		$newW = floor($width * $scale);
		$newH = floor($height * $scale);
		print("width=$newW, height=$newH\n");

		$thumb = imagecreatetruecolor($newW, $newH);
		imagecopyresized($thumb, $orig, 0, 0, 0, 0, $newW, $newH, $width, $height);

		imagejpeg($thumb, $dstFile,100);

		return array(
			'fname' => $dstFile,
			'width' => $newW,
			'height' => $newH,
			"orientation" => $orientation
		);
	}


	function doIteration() {
		$sql = "select * from asset where size1_url is null";
		$assets = doQuery($sql);
		print_r($assets);

		foreach($assets as $asset) {
			$imageUrl = '../photos/' . $asset['url'];
			$outputFilename = '../thumbs/' . $asset['url'];
			$meta = scaleImage($imageUrl, $outputFilename, 200, 200);
			$metaRec = array();
			$metaRec['size1'] = $meta;
			$metaJson = json_encode($metaRec);
			$sql = "update asset set size1_url=:size1_url,  metadata=:meta, pipeline_stage='thumbed' where asset_id=" . $asset['asset_id'];
			$params = array( 'size1_url' => $asset['url'], 'meta' => $metaJson);
			doUpdateNamedParams($sql, $params);
			// $sql = "update asset set size1_url=?, metadata=? where asset_id=" . $asset['asset_id'];
			// $params = array($meta['fname'], $metaJson);
			// doUpdate($sql, $params);
		}		
	}


	// check for newly uploaded images every minute
	while (true) {
		doIteration();
		sleep(60); 
	}


