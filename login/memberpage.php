<?php require('includes/config.php'); 

	function outParam($field, $content) 
	{
		$out = "";
		
		$out .=	"		<tr> \n";
		$out .= "			<td>$field</td> \n";
		$out .= "			<td>$content</td> \n";
		$out .= "		</tr> \n";
		
		return $out;
	}

	//if not logged in redirect to login page
	if(!$user->is_logged_in()){ header('Location: login.php'); } 
	
	//define page title
	$title = 'Hallo ' . $_SESSION['fullName'];
	$titleLink = "<a href='logout.php'>Logout</a> &bull; <a href='changePassword.php'>Kennwort ändern</a>";
	
	//include header template
	require('layout/header.php'); 
	
	
	if(isset($_GET['action'])){
	
		//check the action
		switch ($_GET['action']) {
			case 'passwordChanged':
				echo "<div class='alert alert-success'><strong>Ihr Kennwort wurde geändert.</strong> Sie können sich anmelden.</div>";
				break;
		}
	}
	
	?>
	
	<div class='table-responsive'>

	<table class='table table-hover table-condensed '>
		<thead>
			<tr>
				<th>Parameter</th>
				<th>Wert</th>
			</tr>
		</thead>
		<tbody>
			<?php

			$felder = array_keys($_SESSION);
			foreach ($felder as $feld) {
				echo outParam($feld,$_SESSION[$feld]);
			}
			?>

		</tbody>
	</table>
</div> <!-- end .table-responsive -->

<?php
//include footer template
require('layout/footer.php'); 
?>
