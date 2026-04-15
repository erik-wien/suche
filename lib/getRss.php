<!--

This code defines two functions, rss2html and cutImage.

The rss2html function takes a parameter feed_url which should be the URL of an RSS feed. It uses file_get_contents to fetch the content of the RSS feed, and then uses SimpleXMLElement to parse the XML content. It then builds an HTML output that displays the title, description, and pubDate of the RSS feed, as well as the title, description, link, pubDate, and any images associated with each item in the feed. If an error occurs while fetching or parsing the RSS feed, the function logs the error message and returns an empty string.

The cutImage function takes a string instr which should be a description of an RSS item that may or may not contain an image tag. If instr contains an image tag, the function returns an array with two elements: img which contains the image tag, and description which contains the rest of the description. If instr does not contain an image tag, the function returns an array with img set to an empty string, and description set to the original input string.

(ChatGPT 4)


-->
<?php

function rss2html($feed_url) {
	
	// Use try-catch block to handle errors
	try {
		// Use file_get_contents with a user agent header to fetch the content
		$opts = [
		    "http" => [
		        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36\r\n"
		    ]
		];
		$context = stream_context_create($opts);
		$content = file_get_contents($feed_url, false, $context);

		// Use SimpleXML to parse the XML content.
		// LIBXML_NONET disables any network access from inside the parser
		// (DTDs, xinclude, external entities) as XXE defense-in-depth.
		// PHP 8+ already refuses external entity loading by default.
		if ($content === false || $content === '') {
			return '';
		}
		$xml = new SimpleXMLElement($content, LIBXML_NONET);

		// Build the output HTML
		$out =  "<div class='px-4'>";
		$out .= "   <h1 class='feedTitle'>" . htmlspecialchars($xml->channel->title, ENT_QUOTES) . "</h1>";
		$out .= "   <p class='feedDescription'>" . htmlspecialchars($xml->channel->description, ENT_QUOTES) . "</p>";
		$out .= "   <p class='feedSync text-right small'>" . $xml->channel->pubDate . "</p>";
		$out .= "   <p class='feedSync text-right small'>" . $xml->channel->children('http://purl.org/dc/elements/1.1/')->date . "</p>";
		$out .= "</div>";
	
		$out .= "<div class='card-columns p-1'>";
	
		$items = $xml->channel->item;
		if (empty($items)) {
			$items = $xml;
		}

		foreach ($items as $item) {

			$out .= "<div class='card'>";
           
            $description = $item->description;

            if (strpos($item->description, 'img')) {
                $start = strpos($item->description, 'src="') + 5;
                $stop  = strpos($item->description, '">') - $start;
                $out .= "       <img class='card-img-top' src='" . substr($item->description, $start, $stop) . "' />";
                $description = substr($item->description, strpos($item->description, ">")+1);
            } 
            elseif ($item->enclosure["url"] != "") {
                $out .= "       <img class='card-img-top' src='" . $item->enclosure["url"] . "' />";
            }

            $out .= "<!--" .  $item->enclosure["url"] . "-->";


            $out .= "   <div class='card-body'>";
			$out .= "       <h2 class='card-title feedTitle'>";
            $out .= "        <a class='text-body' href='" . htmlspecialchars($item->link, ENT_QUOTES) . "' title='" . htmlspecialchars($item->title, ENT_QUOTES) . "' target='_blank'>" . htmlspecialchars($item->title, ENT_QUOTES) . "</a>";
            $out .= "       </h2>";
			$out .= "       <p class='card-text'>" . $description . " (<i>" . $item->pubDate . "</i>)</p>";
			$out .= "   </div>";
			$out .= "</div>";
		}
	
		$out .= "</div>";

		return $out;

	} catch (Exception $e) {
    	// Log or display the error message
    	error_log($e->getMessage());
		return "";
	}

}


?>
