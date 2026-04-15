<?php require('includes/config.php');


 
$stmt = $db->prepare("INSERT INTO `member_log` (`userName`, `action`) VALUES (:userName, :action);");
$stmt->execute(array(
	':userName' => $_SESSION['username'],
	':action' => "logout from " . $_SERVER['REMOTE_ADDR']
	));
 
//logout
$user->logout(); 

//logged in return to index page
header('Location: login.php');
exit;
?>