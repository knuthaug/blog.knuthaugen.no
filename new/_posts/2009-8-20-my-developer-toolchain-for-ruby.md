--- 
layout: post
title: My developer toolchain for Ruby
mt_id: 10
date: 2009-08-20 15:49:15 +02:00
---
 I recently learned <a href="http://www.ruby-lang.org/">Ruby</a> and I thought I'd lay out the different tools I use when programming Ruby just for self documentation purposes. Most weight is put on the IDE and the TDD tools that I use.
<h3>IDE</h3>
IDE is a big deal for many people and I have tried two, Eclipse and Emacs. Since I normally only program Ruby on Linux, these are my two alternatives. In Eclipse I've tried the ruby plugin from Aptana and the standard one in the "Programming languages"  section of the eclipse update manager. and I can't say I prefer one over the other. Since Ruby is a dynamic language you won't get the benefit of refactoring and completion like you would in Java, and this has lead me to ditch Eclipse for Ruby in favor of Emacs. What I miss in Emacs is integrated docs and integrated test runner. It's possible in emacs as well but takes some hacking. We'll see if I get around to that. I've been using Emacs for 12 years or so, and the first tool you pick always stick. This is my current ruby setup for Emacs:

```lisp
(autoload 'yaml-mode "yaml-mode" "" t)
(autoload 'ruby-mode "ruby-mode" "" t)
(autoload 'rhtml-mode "rhtml-mode" "" t)

(require 'flymake-ruby)
(add-hook 'ruby-mode-hook 'flymake-ruby-load)

(add-hook 'ruby-mode-hook
          (lambda()
            (add-hook 'local-write-file-hooks
                      '(lambda()
                         (save-excursion
                           (untabify (point-min) (point-max))
                           (delete-trailing-whitespace)
                           )))
            (set (make-local-variable 'indent-tabs-mode) 'nil)
            (set (make-local-variable 'tab-width) 2)
            ;;(imenu-add-to-menubar "IMENU")
            (local-unset-ket "TAB")
            ;;(define-key ruby-mode-map "TAB" 'yas/expand)
            (define-key ruby-mode-map "\C-m" 'newline-and-indent)
            (require 'ruby-electric)
            (ruby-electric-mode t)
            ))

;(add-hook 'ruby-mode-hook
;          '(lambda ()
;             (make-variable-buffer-local 'yas/trigger-key)
;             (setq yas/trigger-key [tab])))

(provide 'ruby)
```
{: class="full-bleed"}

I use flymake to do interactive compile as I type but I suspect I'll be turning this off when Ruby gets more into my fingers.

I want to get irb up and running from within Emacs but haven't gotten that far yet. In addition to the ruby specific stuff I use <a href="http://ecb.sourceforge.net/">ECB</a>, <a href="http://www.emacswiki.org/emacs/AutoComplete">auto-complete</a> and <a href="http://code.google.com/p/yasnippet/">yasnippet</a> for extra support. In fact my complete emacs setup is available at the <a href="http://github.com/knuthaug/emacs/tree/master">emacs github repository</a>. I'm also thinking about getting some elisp together to be able to integrate the testrunner into a shell window in emacs. The shell part isn't hard but it takes some configuring to get the window electric and behaving the way I want.

### TDD/BDD tools

I develop in a TDD/BDD style and most of the tools are geared towards that. Here's a list:
<ul>
        <li>The ruby <a href="http://metric-fu.rubyforge.org/">metric_fu</a> for all your analysis and metric needs. It wraps a lot of other rubygems that are handy. It covers code coverage with <a href="http://eigenclass.org/hiki/rcov">rcov</a>, cyclomatic complexity with <a href="http://saikuro.rubyforge.org/">Saikuro</a>, <a href="http://ruby.sadi.st/Flay.html">Flay</a> for duplication detection, <a href="http://ruby.sadi.st/Flog.html">Flog</a> for misc. pain points, <a href="http://github.com/kevinrutherford/reek/tree/master">reek</a> for code smells and more. Nice graphs and all.</li>
        <li><a href="http://cukes.info/">Cucumber</a> for BDD style outside-in testing. Does a great job both for web applications and non-web applications.</li>
        <li><a href="http://www.ruby-doc.org/stdlib/libdoc/test/unit/rdoc/classes/Test/Unit.html">Test::Unit</a> for low-level unit test for driving out the details of classes.</li>
        <li><a href="http://rspec.info/">RSpec</a> for the times when the Test::Unit assertions feels awkward.</li>
        <li><a href="http://github.com/">Github</a> for storing everything. Git is the coolest version control system since, well, since ever.</li>
</ul>
Generally things move <em>so</em> damn fast in the ruby space and it's hard to keep up when it's not your main activity.

### What's next
I haven't tried Ruby-on-Rails yet and the next webapp idea I get, I'm seriously considering doing that. Yeah, I know. I'm slow. 
