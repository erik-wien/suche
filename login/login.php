<?php
//include config
require_once('includes/config.php');

	//check if already logged in move to home page
	if( $user->is_logged_in() ){ header('Location: index.php'); } 
	
	//process login form if submitted
	if(isset($_POST['submit'])){
	
		$username = $_POST['username'];
		$password = $_POST['password'];
		
		if($user->login($username,$password)){ 
			$stmt = $db->prepare("UPDATE `members` m SET `lastLogin` = NOW() WHERE m.`userName` = :userName; ");
			$stmt->execute(array(
				':userName' => $_SESSION['username']
			));
			$stmt = $db->prepare("INSERT INTO `member_log` (`userName`, `action`) VALUES (:userName, :action);");
			$stmt->execute(array(
				':userName' => $_SESSION['username'],
				':action' => "login from " . $_SERVER['REMOTE_ADDR']
				));
			header('Location: memberpage.php');
			exit;
		
		} else {
			$error[] = 'Falscher Benutzername/Kennwort oder Konto noch nicht aktiviert.';
		}
	
	}//end if submit
	
	//define page title
	$title = 'Login';
	$titleLink = "<a href='reset.php'>Kennwort vergessen?</a> &bull; <a href='./'>Neu hier?</a>";
	
	//include header template
	require('layout/header.php'); 
	
	//check for any errors
	if(isset($error)){
		echo '<div class="row col-lg-12">';
		foreach($error as $error){
			echo '<div class="alert alert-danger">'.$error.'</div>';
		}
		echo '</div>';
	}

	if(isset($_GET['action'])){
		echo '<div class="row col-lg-12">';
		//check the action
		switch ($_GET['action']) {
			case 'active':
				echo "<div class='alert alert-success'><strong>Ihr Konto ist jetzt aktiviert.</strong> Sie können sich anmelden.</div>";
				break;
			case 'reset':
				echo "<div class='alert alert-warning'><strong>Reset Link verschickt.</strong>Bitte prüfen Sie Ihren Posteingang.</div>";
				break;
			case 'resetAccount':
				echo "<div class='alert alert-success'><strong>Kennwort geändert.</strong> Sie können sich anmelden.</div>";
				break;
			case 'logout':
				echo "<div class='alert alert-success'><strong>Sie wurden abgemeldet.</strong> Sie können sich anmelden.</div>";
				break;
		}
		echo '</div>';
	}
	?>
			
	<form role="form" method="post" action="" autocomplete="off" id="loginForm">
		<div class="form-group input-group">	
			<span class="input-group-addon"><i class="fa fa-user" aria-hidden="true"></i></span>
			<input type="text" name="username" id="username" class="form-control" placeholder="Benutzer" value="<?php if(isset($error)){ echo $_POST['username']; } ?>" tabindex="1">
		</div>
		
		<div class="form-group input-group">	
			<span class="input-group-addon"><i class="fa fa-key" aria-hidden="true"></i></span>
			<input type="password" name="password" id="password" class="form-control" placeholder="Kennwort" tabindex="3">
		</div>
			
		<div class="checkbox">
			<label><input type="checkbox" name="rememberme" value="1" tabindex="4"> Merken</label>
		</div>
	
		<button type="submit" name="submit" class="btn btn-primary" tabindex="5">Anmelden</button>
		
	</form>

<?php 
//include header template
require('layout/footer.php'); 
?>
