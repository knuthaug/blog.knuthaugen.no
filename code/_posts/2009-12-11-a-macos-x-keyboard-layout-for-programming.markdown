--- 
layout: post
title: A MacOS X Keyboard Layout for Programming
mt_id: 20
date: 2009-12-11 20:47:08 +01:00
tags: [macos, keyboard, ukulele]
---

I have previously created my [own keyboard layout ](/2009/07/22/keyboard-layout-and-remapping-for-fun-and-profit.html) for windows and Linux in order to have a layout where the often-used keys in programming are more accessible than in the standard Norwegian layout. And when I recently got a (shiny) MacBook pro, I wanted to have the same keyboard layout for the Mac also. Consistency is key across machines, so the layout is the same as in the original progn keyboard layout (most braces and slashes available on home row or the row above). Downside is if decide to update it, I have to update three copies. Oh well...

In the windows and Linux I ended up mapping caps-lock to alt-gr and binding a lot of new key combinations using that modifier. I chose a similar although slightly different model for the Mac. I choose to use the caps-lock key as another alt key (set in the keyboard system preference) and then map keys to alt+<key>for easier access. This means I loose the keys already bound on the alt key, but I keep the original keyboard layout easily accessible, and switching is a breeze. On the positive side, I don't mess with key bindings in either the Terminal app, Aquamacs (when fn is set to be meta) nor IntelliJ IDEA. Here's the finished new bindings:
<img alt="keyboard.png" src="/assets/images/screenshot.png" width="500" height="247" class="mt-image-center" style="text-align: center; display: block; margin: 10px auto 20px;" /><br/> Home row is the most important one, with often used characters, and the braces on homerow+1 on the right hand. Pointy brackets and pipe on the left hand.

### Recipe

Here's how I created the new keyboard layout for mac running 10.6 Snow Leopard (I think it'll work on Leopard (10.5) as well, but haven't tested it). Finding an existing layout in the .keylayout XML format was quite difficult but I found an [extended Norwegian layout](http://jardar.nvg.org/mac/tastatur/index.html) which had some often used keys already mapped nicely, like norwegian quation marksand some others. So I used that as a base.

1. [Download Ukulele from the web page](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=ukelele) and install it.
2. Either start from scratch defining keys in Ukelele or start modifying an existing keyboard layout.
3. Open the character viewer (System preferences -&gt; Language &amp; Text -&gt; Input Sources and select Character and keyboard viewer
4. Drag characters from the character viewer while holding down the desired modifier key.
5. Save under a suitable name. Be creative :-).
6. Copy to "/Library/Keyboard Layouts" for access for all users or "~/Library/Keyboard Layouts" for just your user.
7. log out and log in, and you should be able to choose the new keyboard layout from System Preferences.

I called my keyboard layout progn, like the others I have created and [you can download it](/assets/media/progn.keylayout) if you want to use it for further tweaking. I made it available under the same creative commons license as this blog, so remixing is allowed provided you make the re-mixed versions available to the world wide intertubes.
