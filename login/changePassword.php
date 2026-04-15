<?php 

require('includes/config.php');
 
	//if not logged in redirect to login page
	if( !$user->is_logged_in() ){
	        header('Location: login.php');
	}
	
	//if form has been submitted process it
	if(isset($_POST['submit'])){
 
		//basic validation
        if(strlen($_POST['password']) < 3){
			$error[] = 'Password is too short.';
        }
 
        if(strlen($_POST['aktPassword']) < 3){
			$error[] = 'Please enter your current Password.';
        }

       if(strlen($_POST['password_confirmation']) < 3){
			$error[] = 'Confirm password is too short.';
        }
 
        if($_POST['password'] != $_POST['password_confirmation']){
			$error[] = 'Passwords do not match.';
        }
		
		if( isset($_POST['captcha']) && isset($_SESSION['captcha'])) {
			if( $_POST['captcha'] != (intval($_SESSION['captcha'][0])+intval($_SESSION['captcha'][1])) ) {
				$error[] = 'Invalid captcha answer';  // client does not have javascript enabled
			}
		}
		
		// check old password
		try {
			$stmt = $db->prepare('SELECT password, username, memberID FROM members WHERE username = :username AND active="Yes" ');
			$stmt->execute(array(
				':username' => $_SESSION['username']
				));
			$row = $stmt->fetch(PDO::FETCH_ASSOC);
			$hash = $row['password'];

		} catch(PDOException $e) {
		    echo '<div class="alert alert-danger">'.$e->getMessage().'</div>';
		}
		
		$password  = $_POST['aktPassword'];
		if( !$user->password_verify($password,$hash) ){
			$error[] = 'Kennwort ist falsch.';
		}
 
        //if no errors have been created carry on
        if(!isset($error)){
 
			//hash the password
			$hashedpassword = $user->password_hash($_POST['password'], PASSWORD_BCRYPT);
			
			try {
				// save new password
				$stmt = $db->prepare("UPDATE members SET password = :hashedpassword  WHERE username = :username");
				$stmt->execute(array(
					':hashedpassword' => $hashedpassword,
					':username' => $_SESSION['username']
					));
				
				// log password change
				$stmt = $db->prepare("INSERT INTO `member_log` (`userName`, `action`) VALUES (:username, :action);");
				$stmt->execute(array(
					':username' => $_SESSION['username'],
					':action' => "Password changed from " . $_SERVER['REMOTE_ADDR']
					));
				
				//redirect to index page
				header('Location: memberpage.php?action=passwordChange');
				exit;
			
			//else catch the exception and show the error.
			} catch(PDOException $e) {
				$error[] = $e->getMessage();
			}
        } // end !isset $error
	} // end isset($_POST['submit'])
	 
	//define page title
	$title = "Profil ". $data['fullName'];
	$titleLink ="<a href='reset.php'>Kennwort vergessen?</a> &bull; <a href='login.php'>Zurück</a>";
 
//include header template
require('layout/header.php');
			
	if(isset($stop)){
			 $error[] = "<div class='alert alert-danger'>$stop</div>";
	} else {
		//check the action
		switch ($_GET['action']) {
			case 'passwordChange':
				$error[] = "Ihr Kennwort wurde erfolgreich geändert.";
				break;
		}
		?>
		<!-- Show Form -->
		<form role="form" method="post" action="" autocomplete="off" class="form-horizontal toggle/-disabled">
			<p style="font-size:138%;"><b>Kennwort ändern für <?php echo $_SESSION['fullName']; ?> </b></p>
			
			<div class="row">
				<?php
				//check for any errors
				if(isset($error)){
					echo "<div id='email-error-dialog' class='alert alert-danger'>\n";
					foreach($error as $error){
						echo "<div>$error</div>\n";
					}
					echo "</div>\n";
				}
				?>
			</div>

			<div class="row">
				<div class="col-xs-12 col-sm-6 col-md-12">
					<div class="form-group">
						<label class="control-label" for="aktPassword">Aktuelles Kennwort</label>
						<input type="password" name="aktPassword" id="aktPassword" class="form-control input-md" placeholder="akt.Kennwort" 
							data-validation="server" 
							data-validation-url="validatePassword.php" 
							tabindex="1" 
							value="<?php if(isset($error)){ echo $_POST['aktPassword']; } ?>"
							>
						
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-xs-12 col-sm-6 col-md-4">
					<div class="form-group">
						<label class="control-label" for="password_confirmation">Neues Kennwort</label>
						<!-- data-validation="length" data-validation-length="min6" data-validation-error-msg="Bitte geben Sie ein neues Kennwort mit 6-20 Buchstaben ein."  -->
						<input type="password" name="password_confirmation" class="form-control" placeholder="Kennwort" data-validation="strength" data-validation-strength="1" tabindex="2" value="<?php if(isset($error)){ echo $_POST['password']; } ?>">
					</div>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-4">
					<label class="control-label" for="password">Kennwort bestätigen</label>
					<div class="input-group">
						<input type="password" name="password" class="form-control" placeholder="Kennwort wiederholen" data-validation="confirmation" data-validation-error-msg="Die neuen Kennwörter stimmen nicht überein." tabindex="3"  value="<?php if(isset($error)){ echo $_POST['passwordConfirm']; } ?>">
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-xs-12 col-sm-6 col-md-12">
					<div class="form-group">
						<p>Sicherheitsfrage: 
						<?php 
							$_SESSION['captcha'] = array( mt_rand(0,10), mt_rand(1,10) );
							echo $_SESSION['captcha'][0]." + ".$_SESSION['captcha'][1]." = ";
						?>
							<input name="captcha" class="form-control" tabindex="4" data-validation="spamcheck" style="width: 5rem; display: inline;"
								<?php 
									echo "data-validation-captcha='".($_SESSION['captcha'][0]+$_SESSION['captcha'][1])."'/> ?";
								?>
						</p>
						
						<button type="submit" name="submit" id="submit" value="Kennwort ändern" class="btn btn-primary" tabindex="5" >Kennwort ändern</button>
					</div>
				</div>
			</div>
		</form>

		<?php } ?>
		
<script>
	$(document).ready(function(){
		$.validate({
			borderColorOnError : '#e01',
			validateOnBlur : true,
			addValidClassOnAll : true,
			errorMessagePosition : 'top', // Instead of 'inline' which is default
			// scrollToTopOnError : true, // Set this property to true on longer forms
			// modules : 'html5, security, toggleDisabled',
			modules : 'html5, security',
			//disabledFormFilter : 'form.toggle-disabled',
			onModulesLoaded : function() {
				var optionalConfig = {
					fontSize: '12pt',
					padding: '4px',
					bad : 'Schlecht :-(',
					weak : 'Schwach',
					good : 'Gut',
					strong : 'Stark!'
				};

				$('input[name="password_confirmation"]').displayPasswordStrength(optionalConfig);
			}			
		}); // end validate
	}); // end document.ready
		
</script>

<?php 
//include header template
require('layout/footer.php'); 
?>
