<?php
	use \Psr\Http\Message\ServerRequestInterface as Request;
	use \Psr\Http\Message\ResponseInterface as Response;

	function getFamilyById($container, $id) {
		$sql = "select * from family where family_id=?";
		$stmt = $container->db->prepare($sql);
		// $extid = $request->getParam('extid');
		$stmt->bindParam(1, $id);
		$rows = [];
		if ($stmt->execute()) {
			while ($row = $stmt->fetch()) {
				$rows[]=$row;
			}
			$container->logger->addInfo("retrieved family $id");
	 	} else {
			$container->logger->addInfo("retrieve family $id failed");
		}
		if (count($rows) == 0) {
			return null;
		}
		return $rows[0];
	}

	function getFamilyByExtId($container, $extId) {
		$sql = "select * from family where family_extid=?";
		$stmt = $container->db->prepare($sql);
		// $extid = $request->getParam('extid');
		$stmt->bindParam(1, $extId);
		$rows = [];
		if ($stmt->execute()) {
			while ($row = $stmt->fetch()) {
				$rows[]=$row;
			}
			$container->logger->addInfo("retrieved family $extId");
	 	} else {
			$container->logger->addInfo("retrieve family $extId failed");
		}
		if (count($rows) == 0) {
			return null;
		}
		return $rows[0];
	}


	function insertFamily($container, $params) {
		$sql = "insert into family  (family_extid, display_name) values (:family_extid, :display_name)";
		$stmt = $container->db->prepare($sql);
		$stmt->execute($params);
		return $container->db->lastInsertId();                        		
	}

	function updateFamily($container, $primaryKeyId, $params) {
		$sql = "update family set family_extid = :family_extid, display_name = :display_name where family_id= :family_id";
		$stmt = $container->db->prepare($sql);
		$params["family_id"] = $primaryKeyId;
		$stmt->execute($params);
	}

	function deleteFamily($container, $extId) {
		$sql = "delete from family where family_extid = :family_extid";
		$stmt = $container->db->prepare($sql);
		$params = array( "family_extid" => $extId);
		$stmt->execute($params);
	}


	$app->get('/family/{extid}', function (Request $request, Response $response, $args) {
		$row = getFamilyByExtId($this, $args['extid']);
		$response->getBody()->write(json_encode($row, JSON_PRETTY_PRINT));

		return $response;
	});

	$app->post('/family', function (Request $request, Response $response) {
		$familyId = $request->getParam("family_id");
		$params = array(
			"family_extid" => $request->getParam("extid"),
			"display_name" => $request->getParam("name")
		);

		if (!empty($familyId)) {
			updateFamily($familyId,$params);
		} else {
			$row = getFamilyByExtId($this, $params["family_extid"]);
			$finalFamily = array();
			if (empty($row)) {
				$primaryKeyId = insertFamily($this, $params);
				// $finalFamily = getFamilyById($this, $newId);
			} else {
				$primaryKeyId = $row['family_id'];
				updateFamily($this, $primaryKeyId, $params);
			}
			$finalFamily = getFamilyById($this, $primaryKeyId);
		}

		$response->getBody()->write(json_encode($finalFamily, JSON_PRETTY_PRINT));

		return $response;
	});

	$app->delete('/delete/{extid}', function($request, $response, $args) {

	})

?>