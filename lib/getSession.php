<?php
/*
	if( !$user->is_logged_in() ){
		header('Location: memberpage.php');
	} else {} // Session expired
*/

$cookie = isset($_COOKIE['rememberme']) ? $_COOKIE['rememberme'] : '';

if (!$cookie == ""){ // there's a cookie
	if (rememberme()) { // is the cookie valid?
		$dbUser = fetchUser($userName); // get data from database
		
		$_SESSION['xmlMenue'] 		= $dbUser['menue'];
		$_SESSION['menueHomeTitle']	= $dbUser['title']; 
		$_SESSION['menueHomeurl'] 	= $dbUser['url'];
		$_SESSION['xmlButtons'] 	= $dbUser['buttons'];
		$_SESSION['RSSFeedUrl'] 	= $dbUser['rss'];
		$_SESSION['userName'] 		= $dbUser['userName'];
		$_SESSION['fullName'] 		= $dbUser['fullName'];
	}
} else { // load default data
	$_SESSION['xmlMenue'] 		= "data/menue.xml";
	$_SESSION['menueHomeTitle'] = "jardyx.com";
	$_SESSION['menueHomeUrl'] 	= "http://www.jardyx.com";
	$_SESSION['xmlButtons'] 	= "data/buttons.xml";
	$_SESSION['RSSFeedURL'] 	= "http://derstandard.at/?page=rss&amp;ressort=Newsroom";
	$_SESSION['userName'] 		= "login";
	$_SESSION['fullName'] 		= "please login";
}

fetchUser($userName) {
	$stmt = $db->prepare('SELECT * FROM members WHERE userName = :userName');
	$stmt->execute(array(':userName' => $userName));
	$row = $stmt->fetch(PDO::FETCH_ASSOC);
	return $row
}

// transfer data to javascript
echo "<script>\n";
echo "	var xmlMenue = '" 		. $xmlMenue 		. "';\n";
echo "	var menueHomeTitle = '" . $menueHome[title] 	. "';\n";
echo "	var menueHomeUrl = '" 	. $menueHome[url] 	. "';\n";
echo "	var xmlButtons = '" 	. $xmlButtons 		. "';\n";
echo "	var RSSFeedUrl = '" 	. $RSSFeedUrl 		. "';\n";
echo "	var userName = '" 		. $userName 		. "';\n";
echo "	var fullName = '" 		. $fullName 		. "';\n";
echo "</script>";

?>