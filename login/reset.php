<?php require('includes/config.php');

//if logged in redirect to members page
if( $user->is_logged_in() ){ header('Location: memberpage.php'); }

//if form has been submitted process it
if(isset($_POST['submit'])){

	//email validation
	if(!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
	    $error[] = 'Bitte geben Sie eine gültige Mail Adresse an!';
	} else {
		$stmt = $db->prepare('SELECT email, userName FROM members WHERE email = :email');
		$stmt->execute(array(':email' => $_POST['email']));
		$row = $stmt->fetch(PDO::FETCH_ASSOC);

		if(empty($row['email'])){
			$error[] = 'Mail Adresse unbekannt.';
		}

	}

	//if no errors have been created carry on
	if(!isset($error)){

		//create the activasion code
		$token = md5(uniqid(rand(),true));

		try {

			$stmt = $db->prepare("UPDATE members SET resetToken = :token, resetComplete='No' WHERE email = :email");
			$stmt->execute(array(
				':email' => $row['email'],
				':token' => $token
			));
 
			$stmt = $db->prepare("INSERT INTO `member_log` (`userName`, `action`) VALUES (:userName, :action);");
            $stmt->execute(array(
				':userName' => $row['userName'],
				':action' => "Reset password for " . $row['email'] . " from " . $_SERVER['REMOTE_ADDR']
            ));
 

			//send email
			$to = $row['email'];
			$subject = "Kennwort vergessen";
			$body = "<p>Jemand hat verlangt, dass das Kennwort zurück gesetzt wird.</p>
			<p>Sollte das ein Irrtum gewesen sein, ignorieren Sie dieses Mail einfach. Nichts wird passieren.</p>
			<p>Um ein neues Kennwort einzugeben, besuchen Sie bitte diese Adresse: <a href='".DIR."resetPassword.php?key=$token'>".DIR."resetPassword.php?key=$token</a></p>";

			$mail = new Mail();
			$mail->setFrom(SITEEMAIL);
			$mail->addAddress($to);
			$mail->subject($subject);
			$mail->body($body);
			$mail->send();

			//redirect to index page
			header('Location: login.php?action=reset');
			exit;

		//else catch the exception and show the error.
		} catch(PDOException $e) {
		    $error[] = $e->getMessage();
		}

	}

}

//define page title
$title = 'Kennwort vergessen';

//include header template
require('layout/header.php');
?>

<div class="container">

	<div class="row">

	    <div class="col-xs-12 col-sm-8 col-md-6 col-sm-offset-2 col-md-offset-3">
			<form role="form" method="post" action="" autocomplete="off">
				<h2>Kennwort vergessen</h2>
				<p><a href='login.php'>Zurück zur Anmelde-Seite</a></p>
				<hr>

				<?php
				//check for any errors
				if(isset($error)){
					foreach($error as $error){
						echo '<p class="bg-danger">'.$error.'</p>';
					}
				}

				if(isset($_GET['action'])){

					//check the action
					switch ($_GET['action']) {
						case 'active':
							echo "<h2 class='bg-success'>Ihr Konto ist jetzt aktiv. Sie können sich anmelden.</h2>";
							break;
						case 'reset':
							echo "<h2 class='bg-success'>Prüfen Sie bitte Ihren Posteingang wegen eines Rücksetz-Links.</h2>";
							break;
					}
				}
				?>

				<div class="form-group">
					<input type="email" name="email" id="email" class="form-control input-lg" placeholder="Email" value="" tabindex="1">
				</div>

				<hr>
				<div class="form-group">
					<div class="col-xs-6 col-md-6"><input type="submit" name="submit" value="Suchen" class="btn btn-primary btn-block btn-lg" tabindex="2"></div>
				</div>
				
			</form>
		</div>
	</div>


</div>

<?php
//include header template
require('layout/footer.php');
?>
