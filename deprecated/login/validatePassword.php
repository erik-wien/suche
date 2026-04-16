<?php
require('includes/config.php');

		$response = array(
			'valid' => false,
			'message' => 'Geben Sie Ihr aktuelles Kennwort ein.'
			);
		//if not logged in redirect to login page
		if( !$user->is_logged_in() ){
			$response = array('valid' => false, 'message' => 'Das Kennwort konnte nicht ermittelt werden.');
		}

		if( isset($_POST['aktPassword']) ) {
			
			// check old password
			try {
				$stmt = $db->prepare('SELECT password, username, memberID FROM members WHERE username = :username AND active="Yes" ');
				$stmt->execute(array(
					':username' => $_SESSION['username']
					));

				$row = $stmt->fetch(PDO::FETCH_ASSOC);
				$hash = $row['password'];

			} catch(PDOException $e) {
				echo '<p class="bg-danger">'.$e->getMessage().'</p>';
			}

			$password  = $_POST['aktPassword'];

			if(!$user->password_verify($password,$hash)){
				// User name is registered on another account
				$response = array('valid' => false, 'message' => 'Das Kennwort ist falsch.');
			} else {
				// User name is available
				$response = array('valid' => true, 'message' => 'Das Kennwort stimmt.');
			}
		}
		
		echo json_encode($response);
		
?>