---
layout: post
title: A SyntaxHighlighter brush for Lisp
mt_id: 14
date: 2009-10-14 21:13:31 +02:00
tags: [lisp, javascript, code]
---

I previously used <a href="http://alexgorbatchev.com/wiki/SyntaxHighlighter">SyntaxHighlighter</a> for highlighting code snippets on this blog and I found out that it didn't come with a brush for the 2.0 version highlighting lisp code. So I wrote my own. I found a SyntaxHighlighter 1.5 brush <a href="http://han9kin.doesntexist.com/22">through google</a> and I converted that to a 2.0 brush and it's now in a state that sort of works. At least it highlights some code :-) I used that as an excuse to try out qunit as well and write some unit/integration tests for the code. <a href="http://github.com/jquery/qunit">Qunit</a> is cool. There's not much code in the brush itself as it leans heavily on the core SyntaxHighlighter stuff. So the tests are testing the framework also. But hey, I'm not picky.<br /><br />It's all to be found on <a href="http://github.com/knuthaug/sh-lisp">github:knuthaug/sh-lisp</a>.Patches/pulls via github is more than welcome. I plan to dig out my copy of "Ansi common Lisp" and go through the lists of functions, keywords and macros a bit more in detail. Some more tests are in order to. One question which comes to mind is if it's best to do one that does common lisp and emacs-lisp, or one brush for each dialect?<br /><br />Here's the code for brush:<br />

```javascript
SyntaxHighlighter.brushes.Lisp = function () {
  var funcs = "lambda list progn mapcar car cdr reverse member append format";
  var keywords =
    "let while unless cond if eq t nil defvar dotimes setf listp numberp not equal";
  var macros = "loop when dolist dotimes defun";
  var operators = "> < + - = * / %";

  this.regexList = [
    { regex: SyntaxHighlighter.regexLib.doubleQuotedString, css: "string" },
    { regex: new RegExp("&\\w+;", "g"), css: "plain" },
    { regex: new RegExp(";.*", "g"), css: "comments" },
    { regex: new RegExp("'(\\w|-)+", "g"), css: "variable" },
    { regex: new RegExp(this.getKeywords(keywords), "gm"), css: "keyword" },
    { regex: new RegExp(this.getKeywords(macros), "gm"), css: "keyword" },
    { regex: new RegExp(this.getKeywords(funcs), "gm"), css: "functions" },
  ];
};

SyntaxHighlighter.brushes.Lisp.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.Lisp.aliases = ["lisp"];
```
{: class="full-bleed"}
