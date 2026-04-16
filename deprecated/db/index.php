<?php
// SECURITY GATE — 2026-04-15
// Legacy bootgrid menu editor; its backend (response.php) had
// unauthenticated SQL injection. Disabled pending rewrite.
http_response_code(403);
header('Content-Type: text/plain; charset=utf-8');
exit("Disabled pending rewrite.\n");
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>user menu</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
		<link rel="stylesheet" href="bootgrid/jquery.bootgrid.min.css">
	</head>
<body>
	<?php include_once("connection.php"); ?>

	<div class="jumbotron text-center">
		<h1>jardyx.com</h1>
		<p>Menü Editor</p>
	</div>
		
	<div class="well clearfix">
		<div class="pull-right">
			<button type="button" class="btn btn-xs btn-primary" id="command-add" data-row-id="0">
			<span class="glyphicon glyphicon-plus"></span> Eintrag</button>
		</div>
	</div>
					
		<table id="employee_grid" class="table table-condensed table-hover table-striped" cellspacing="0" data-toggle="bootgrid">
			<thead>
				<tr>
					<th data-column-id="id" data-type="numeric" data-identifier="true">Item #</th>
					<th data-column-id="idUser">User</th>
					<th data-column-id="navItem">Menu</th>
					<th data-column-id="dropdown-header">Zwischenüberschrift</th>
					<th data-column-id="dropdown-item">Eintrag</th>
					<th data-column-id="symbolFa">symbol </th>
					<th data-column-id="symbolImg">Url zu IMG</th>
					<th data-column-id="Url">Link</th>
					<th data-column-id="Window">Ziel</th>
					<th data-column-id="dateModified">Änd</th>
					<th data-column-id="commands" data-formatter="commands" data-sortable="false">Commands</th>
				</tr>
			</thead>
		</table>
	</div>



	<!-- Modal form Box-->
<div id="add_model" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title">Add Employee</h4>
            </div>
            
            <form method="post" id="frm_add">
				<input type="hidden" value="add" name="action" id="action">
            <div class="modal-body">
					<? readfile("formInput.html"); ?>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <button type="button" id="btn_add" class="btn btn-primary">Save</button>
            </div>
            
			</form>
        </div>
    </div>
</div>
<div id="edit_model" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
			
				<div class="modal-header">
					<h4 class="modal-title">Menü Eintrag</h4> 
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>
				
                <form method="post" id="frm_edit">
					<input type="hidden" value="edit" name="action" id="action">
					<input type="hidden" value="0" name="edit_id" id="edit_id">
					
					<div class="modal-body">
						<? readfile("formInput.html"); ?>
					</div>
					
					<div class="modal-footer">
		                <button type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>
		                <button type="button" id="btn_edit" class="btn btn-primary">Bearbeiten</button>
					</div>
				</form>
			</div>
		</div>
	</div>
	

</body>
</html>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>

<script src="bootgrid/jquery.bootgrid.min.js"></script>
<script src="bootgrid/jquery.bootgrid.fa.min.js"></script>
  

<script type="text/javascript">
$( document ).ready(function() {
	var grid = $("#employee_grid").bootgrid({
		ajax: true,
		rowSelect: true,
		post: function ()
		{
			/* To accumulate custom parameter with the request object */
			return {
				id: "b0df282a-0d67-40e5-8558-c9e93b7befed"
			};
		},
		
		url: "response.php",
		formatters: {
		        "commands": function(column, row)
		        {
		            return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-edit\"></span></button> " + 
		                "<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-trash\"></span></button>";
		        }
		    }
   }).on("loaded.rs.jquery.bootgrid", function()
{
    /* Executes after data is loaded and rendered */
    grid.find(".command-edit").on("click", function(e)
    {
        //alert("You pressed edit on row: " + $(this).data("row-id"));
			var ele =$(this).parent();
			var g_id = $(this).parent().siblings(':first').html();
            var g_name = $(this).parent().siblings(':nth-of-type(2)').html();
			console.log(g_id);
			console.log(g_name);

		//console.log(grid.data());//
		$('#edit_model').modal('show');
					if($(this).data("row-id") >0) {
							
                        // collect the data
						$('#edit_id').val(ele.siblings(':first').html()); // in case we're changing the key
						$('#edit_idUser').val(ele.siblings(':nth-of-type(2)').html());
						$('#edit_navItem').val(ele.siblings(':nth-of-type(3)').html());
						$('#edit_dropdown-header').val(ele.siblings(':nth-of-type(4)').html());
						$('#edit_dropdown-item').val(ele.siblings(':nth-of-type(5)').html());
						$('#edit_symbolFa').val(ele.siblings(':nth-of-type(6)').html());
						$('#edit_symbolImg').val(ele.siblings(':nth-of-type(7)').html());
						$('#edit_Url').val(ele.siblings(':nth-of-type(8)').html());
						$('#edit_window').val(ele.siblings(':nth-of-type(9)').html());



					} else {
					 alert('Now row selected! First select row, then click edit button');
					}
    }).end().find(".command-delete").on("click", function(e)
    {
	
		var conf = confirm('Delete ' + $(this).data("row-id") + ' items?');
					alert(conf);
                    if(conf){
                                $.post('response.php', { id: $(this).data("row-id"), action:'delete'}
                                    , function(){
                                        // when ajax returns (callback), 
										$("#employee_grid").bootgrid('reload');
                                }); 
								//$(this).parent('tr').remove();
								//$("#employee_grid").bootgrid('remove', $(this).data("row-id"))
                    }
    });
});

function ajaxAction(action) {
				data = $("#frm_"+action).serializeArray();
				$.ajax({
				  type: "POST",  
				  url: "response.php",  
				  data: data,
				  dataType: "json",       
				  success: function(response)  
				  {
					$('#'+action+'_model').modal('hide');
					$("#employee_grid").bootgrid('reload');
				  }   
				});
			}
			
			$( "#command-add" ).click(function() {
			  $('#add_model').modal('show');
			});
			$( "#btn_add" ).click(function() {
			  ajaxAction('add');
			});
			$( "#btn_edit" ).click(function() {
			  ajaxAction('edit');
			});
});
</script>
