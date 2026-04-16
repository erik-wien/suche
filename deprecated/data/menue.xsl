<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
	<html>
	<head>
		<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous" />
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
	</head>
	<body>
	<nav class="navbar navbar-toggleable-sm navbar-inverse bg-inverse fixed-top">
		<button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<a class="navbar-brand" href=".">Navbar</a>

		<div class="navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav">
			<xsl:for-each select="items/category">
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<xsl:value-of select='cattitle'/></a>
		        	<div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
		        		<xsl:for-each select="item">
							<a class="dropdown-item" href="">
								<xsl:attribute name="href">
									<xsl:value-of select='url'/>
				  				</xsl:attribute>
				    			<xsl:value-of select="title"/>
							</a><xsl:text>&#xa;</xsl:text>
						</xsl:for-each>
					</div>
				</li>
			</xsl:for-each>
    		</ul>
  		</div>
		<div class="navy navbar-nav justify-content-end">
			<button class="btn bg-inverse text-muted" data-toggle="modal" data-target="#myModal"><span class="glyphicon glyphicon-info"></span> About</button>
		</div>
	</nav>
	</body>
	</html>
</xsl:template>
</xsl:stylesheet>

