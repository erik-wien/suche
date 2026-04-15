<?php

/*
isloggedin()
yes: go ($_SESSION)
no: check $_COOKIE
	yes: validate, renew, set $_SESSION
	no: login.php
	
cookie validation:
	exists? (<40 days)
	token for userID exists?
	signature valid?
	ladtLogin < 120 days?

*/


include('password.php');
class User extends Password{

    private $_db;

    function __construct($db){
    	parent::__construct();

    	$this->_db = $db;
    }

	private function get_user_hash($username){

		try {
			$stmt = $this->_db->prepare('SELECT password, username, memberID FROM members WHERE username = :username AND active="Yes" ');
			$stmt->execute(array('username' => $username));

			return $stmt->fetch();

		} catch(PDOException $e) {
		    echo '<p class="bg-danger">'.$e->getMessage().'</p>';
		}
	}

	public function login($username,$password){

		$row = $this->get_user_hash($username);

		if($this->password_verify($password,$row['password']) == 1){

		    $_SESSION['loggedin'] = true;
		    $_SESSION['username'] = $row['username'];
		    $_SESSION['memberID'] = $row['memberID'];
			
			// Get User Parameters
			try {

				$stmt = $this->_db->prepare("SELECT * FROM `member_data` WHERE userName = :userName ORDER BY field ");
				if ($stmt->execute(array(
						':userName' => $_SESSION['username']
						))) {
							while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
								$_SESSION[$row['field']] = $row['data'];
								// echo ("<p>". $row['field']." ");
								// echo ($row['data']." </p>");
							}
				}

			//else catch the exception and show the error.
			} catch(PDOException $e) {
				$error[] = $e->getMessage();
			} // end try
			
		    return true;
		}
	}

	public function logout(){
		session_destroy();
	}

	public function is_logged_in(){
		if(isset($_SESSION['loggedin']) && $_SESSION['loggedin'] == true){
			return true;
		}
	}

}


?>
