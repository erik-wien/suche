<?php

function rss2html($feed_url) {
	
	set_error_handler(
		function ($severity, $message, $file, $line) {
			throw new ErrorException($message, $severity, $severity, $file, $line);
		}
	);

try {
	 
	$content = file_get_contents($feed_url);
	$x = new SimpleXmlElement($content);

	$out = "		<div class='card-header'>";
	$out .= "			<h1 class='feedTitle'>". htmlspecialchars($x->channel->title) ."</h1>";
	$out .= "			<p class='feedDescription'>". htmlspecialchars($x->channel->description) ."</p>";
	$out .= "			<p class='feedSync' class='text-right small'>".$x->channel->pubDate."</p>";
	$out .= "			<p class='feedSync' class='text-right small'>".$x->channel->dc->date."</p>";
	$out .= "		</div>";
	
	$out .= "		<div class='card-body'>";
	
	$items = $x->channel;
	if ($items->item->title == "") $items = $x;
	foreach($items->item as $entry) {
		$out .= "			<div class='item'>";
		$out .= "				<h2 class='feedTitle'><a class='text-body' href='$entry->link' title='" . htmlspecialchars($entry->title, ENT_QUOTES) . "' target='News'>" . htmlspecialchars($entry->title, ENT_QUOTES) . "</a></h5>";
		$out .= "				<p>" . $entry->description . " (<i>" . $entry->pubDate . "</i>)</p>";
		$out .= "			</div>";
	}
	
	//$out .= "<pre>" . print_r($items) . "</pre>";
	
	$out .= "		</div>";



	return $out;
	
	}
catch (Exception $e) {
    echo $e->getMessage();
}

restore_error_handler();
}

?>