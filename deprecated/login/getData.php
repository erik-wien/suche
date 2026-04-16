<?php
//include config
require_once('includes/config.php');

//check if already logged in move to home page
if( !$user->is_logged_in() ){ header('Location: index.php'); } 


// Get User Parameters
try {

	$stmt = $db->prepare("SELECT * FROM `member_data` WHERE userName = :userName ORDER BY field ");
	if ($stmt->execute(array(
			':userName' => $_SESSION['username']
			))) {
				while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
					$_SESSION[$row['field']] = $row['data'];
					// echo ("<p>". $row['field']." ");
					// echo ($row['data']." </p>");
				}
	}
	// exit;

//else catch the exception and show the error.
} catch(PDOException $e) {
	$error[] = $e->getMessage();
} // end try


//define page title
$title = 'Login';

//include header template
require('layout/header.php'); 

function outParam($field, $content) 
{
	$out = "";
	
	$out .=	"		<tr> \n";
	$out .= "			<td>$field</td> \n";
	$out .= "			<td>$content</td> \n";
	$out .= "		</tr> \n";
	
	return $out;
}

?>

	
<div class="container">

	<h2>Profil <?php echo $data['fullName']; ?></h2>
	<p><a href='./'>Back to home page</a></p>
	<hr>

	<?php
	//check for any errors
	if(isset($error)){
		foreach($error as $error){
			echo '<div class="alert alert-danger">'.$error.'</div>';
		}
	}

	if(isset($_GET['action'])){

		//check the action
		switch ($_GET['action']) {
			case 'active':
				echo "<div class='alert alert-success'>Your account is now active you may now log in.</div>";
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
</div> <!-- end .container -->


<?php 
//include header template
require('layout/footer.php'); 
?>
