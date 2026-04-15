<?php
	/* =============================================
		start session and include form class
	============================================= */

	session_start();
	include_once rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . '/phpformbuilder/Form.php';
	require_once rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . '/phpformbuilder/database/db-connect.php';
	require_once rtrim($_SERVER['DOCUMENT_ROOT'], DIRECTORY_SEPARATOR) . '/phpformbuilder/database/Mysql.php';
	
	use phpformbuilder\Form;
	use phpformbuilder\Validator\Validator;
	use phpformbuilder\database\Mysql;


//include_once 'phpformbuilder/Form.php';

/* =============================================
	validation if posted
============================================= */

if ($_SERVER["REQUEST_METHOD"] == "POST" && Form::testToken('user-form') === true) {

	// create validator & auto-validate required fields
	$validator = Form::validate('user-form');

	// additional validation
	$validator->email()->validate('user-email');

	// check for errors
	if ($validator->hasErrors()) {
		$_SESSION['errors']['user-form'] = $validator->getAllErrors();
	} else {


		$db = new Mysql();
		$filter['memberID']			= Mysql::sqlValue($_POST['memberID'], Mysql::SQLVALUE_NUMBER);
		$update['userName']			= Mysql::SQLValue($_POST['username']);
		$update['password']			= Mysql::SQLValue($_POST['password']);
		$update['email']			= Mysql::SQLValue($_POST['email']);
		
		$roles					 	= json_encode($_POST['roles']);
		$update['role']				= Mysql::SQLValue($role);
		$update['active']			= Mysql::SQLValue($_POST['active']);
		$update['emailVerified']	= Mysql::SQLValue($_POST['emailVerified']);
		$update['resetComplete']	= Mysql::SQLValue($_POST['resetComplete']);
		$update['wrongLogins'] 		= Mysql::SQLValue($_POST['wrongLogins']);
		$update['DateCreated']		= Mysql::SQLValue($_POST['DateCreated']);
		$update['DateModified']		= Mysql::SQLValue($_POST['DateModified']);
		$update['lastLogin']		= Mysql::SQLValue($_POST['lastLogin']);

/*	  (disabled in demo - no database enabled) */

		if (!$db->UpdateRows('users', $update, $filter)) {
			$msg = '<p class="alert alert-danger">' . $db->error() . '<br>' . $db->getLastSql() . '</p>' . "\n";
		} else {
//*/
			$db->UpdateRows('users', $update, $filter);
			$msg = '<p class="alert alert-success">Database updated successfully !<br>Last query : <strong>' . $db->getLastSql() . '</strong></p>'. " \n";
///*
	   }
//*/
	}
}

$_SESSION['memberID'] = 3;
if(isset($_SESSION['memberID']) && is_numeric($_SESSION['memberID'])) {
	$memberID = $_SESSION['memberID'];
}
if (!isset($_SESSION['errors']['user-form']) || empty($_SESSION['errors']['user-form'])) { // If no error posted

	$db = new Mysql();
	$columns = $db->getColumnNames("users");
	$qry = "SELECT * FROM members WHERE memberID='$memberID'";
	$db->query($qry);
	$row = $db->Row();
	foreach ($columns as $columnName) {
		if($columnName == 'roles') {
			$_SESSION['user-form'][$columnName] = json_decode($row->$columnName);
		} else {
			$_SESSION['user-form'][$columnName] = $row->$columnName;
		}
	}

	
}

$form = new form('user-form', 'horizontal', 'validate', 'material');
$form->startFieldset('Grundeinstellungen');

$form->addHtml('<div class="input-field row"><label class="col-sm-4">Member ID:</label><div class="col-sm-8">'.$_SESSION['memberID'].'</div></div>');

$form->addInput('text', 'username', $username, 'Username', 'size=60, required');
$form->addInput('password', 'password', password, 'Kennwort', 'size=60, disabled');
$form->addInput('email', 'E-Mail', $email, 'email : ', 'size=60, required');

$form->addRadio('active', 'Ja', 1);
$form->addRadio('active', 'Nein', 0);
$form->printRadioGroup('active', 'Aktiv?');

$form->addRadio('emailVerified', 'Ja', 1);
$form->addRadio('emailVerified', 'Nein', 0);
$form->printRadioGroup('emailVerified', 'E-Mail überprüft?');


$form->addOption('roles[]', 'User', 'User');
$form->addOption('roles[]', 'Admin', 'Admin');
//$form->addHelper('Wählen Sie eine Rolle', 'roles[]');
$form->addSelect('roles[]', 'Rollen', 'class=selectpicker, required, multiple=no');

$form->addBtn('button', 'cancel', 0, '<span class="glyphicon glyphicon-remove prepend"></span>Abbrechen', 'class=btn btn-warning, data-dismiss=modal', 'btn-group');
$form->addBtn('submit', 'submit', 1, 'Speichern <span class="glyphicon glyphicon-ok append"></span>', 'class=btn btn-success', 'btn-group');

$form->printBtnGroup('btn-group');
$form->endFieldset();

// jQuery validation
$form->addPlugin('formvalidation', '#user-form');
?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Benutzer Profil</title>
	<meta name="description" content="Material Design Form Generator - how to retrieve default fields values from database with Php Form Builder Class">

	<!-- Bootstrap CSS -->
	<link href="/phpformbuilder/assets/css/bootstrap.min.css" rel="stylesheet">
	<?php $form->printIncludes('css'); ?>
</head>

<body>

	<div class="container">
		<div class="row">
			<div class="col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">
			<?php
			if (isset($msg)) {
				echo $msg;
			}
			$form->render();
			?>
			</div>
		</div>
	</div>
	
	
	<!-- jQuery -->
	<script src="//code.jquery.com/jquery.min.js"></script>
	<!-- Bootstrap JavaScript -->
	<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	<?php
		$form->printIncludes('js');
		$form->printJsCode();
		
		echo "<PRE>";
		print_r($_SESSION);
		echo "</PRE>";

	?>

</body>
</html>		
  