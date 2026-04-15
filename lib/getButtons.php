
			<!--button class="button btn btn-primary btn-danger linkButton" url="https://www.tuv-elearning.at/">
				<img class="img-responsive" src="pix/moodle.png">
				Moodle
			</button-->
			




<?php
		
	$dataUrl = "data/buttons-erik.xml";
	
	set_error_handler(
		function ($severity, $message, $file, $line) {
			throw new ErrorException($message, $severity, $severity, $file, $line);
		}
	);

	try {
		 
		$content = file_get_contents($dataUrl);
		$items = new SimpleXmlElement($content);
		
		foreach($items->button as $entry) {

			// Escape every interpolated XML value before it lands in HTML
			// attributes. Previously only `title` was escaped, leaving
			// `url`/`class`/`img`/`icon` as XSS sinks if the XML source
			// ever became user-editable.
			$class = htmlspecialchars((string)$entry->class, ENT_QUOTES, 'UTF-8');
			$url   = htmlspecialchars((string)$entry->url,   ENT_QUOTES, 'UTF-8');
			$img   = htmlspecialchars((string)$entry->img,   ENT_QUOTES, 'UTF-8');
			$icon  = htmlspecialchars((string)$entry->icon,  ENT_QUOTES, 'UTF-8');
			$title = htmlspecialchars((string)$entry->title, ENT_QUOTES, 'UTF-8');

			$out  = "<button class='button btn linkButton shadow-sm mx-1 px-1 btn-$class' url='$url'>";
			$out .= ($img !== '') ? "	<img class='img-responsive' src='$img'>" : "	<i class='$icon' style='font-size:16px;'> </i> ";
			$out .= $title;
			$out .= "</button>";

			echo $out;
		}
		
		//$out .= "<pre>" . print_r($items) . "</pre>";
		
		}
	catch (Exception $e) {
		echo $e->getMessage();
	}
	
	restore_error_handler();
	
	
	/*
	$linkButtons = array
	(
		array("Moodle",			"https://www.tuv-elearning.at/", 		"btn-danger",		"moodle.png"),
		array("W3 Schools",		"https://www.w3schools.com/", 			"btn-info",			"w3schools.png"),
		array("Surveys",		"https://www.tuv-elearning.at/survey", 	"btn-secondary",	"limesurvey.png"),
		array("Moodle",			"https://www.tuv-elearning.at/", 		"btn-danger",		"moodle.png")
	);
		
	foreach ($linkButtons as $linkButton) {
		
		echo ("<button class='button btn linkButton shadow-sm mx-0 mr-1 $linkButton[2]' url='$linkButton[1]'>");
		echo ("	<img class='img-responsive' src='pix/$linkButton[3]'>");
		echo ("	$linkButton[0]");
		echo ("</button>");
	};
	*/
?>

