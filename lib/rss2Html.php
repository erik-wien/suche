<!DOCTYPE html>
<html lang="de">

<head>
  <title>RSS News</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</head>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
    <s-cript src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

<body>

    <ul class="nav nav-pills nav-justified">
        <li class="nav-item">
            <a class="nav-link active" data-toggle="tab" href="#home" >Mac Tech-News</a>
        </li>
        <li class="nav-item">
            <a class="nav-link"        data-toggle="tab" href="#menu2">Der Standard</a>
        </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
      <div class="tab-pane container active" id="home" ><?=rss2html('https://www.mactechnews.de/Rss/News.x')?></div>
      <div class="tab-pane container fade"   id="menu2"><?=rss2html('https://derstandard.at/?page=rss&ressort=seite1')?></div>
    </div>

</body>
</html><?php
 
function rss2html($feed_url) {
     
    $content = file_get_contents($feed_url);
    $x = new SimpleXmlElement($content);
    
    $out  = "<h1>" . $x->channel->title . "</h1>";
    /* $out .= "<p><small>Update " . $x->channel->pubDate. "</small></p>";
    */

    $out .= '<ul class="list-group">';
     
    foreach($x->channel->item as $entry) {
        $out .= "<li  class='list-group-item'><a href='$entry->link' title='$entry->title'>" . $entry->title . "</a><br /><i>" . $entry->description . "</i> (" . $entry->pubDate . ")</li>";
    }
    $out .= "</ul>";

    return $out;
}

?>		