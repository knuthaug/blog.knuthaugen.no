--- 
layout: post
title: Keyboard layout and remapping for fun and profit
mt_id: 6
date: 2009-07-22 10:18:27 +02:00
---
After having lived with some annoying CAPS-LOCK mishaps and a general feeling of pain in the lower forearm, I decided to remap my keyboard layout for a smoother programming experience. Since I'm Norwegian and use a Norwegian keyboard layout, I have to resort to <kbd>AltGr+0</kbd> to produce a }. Brackets are equally far away. Parenthesis are <kbd>shift+8</kbd> and <kbd>shift+9</kbd> on the number row and all this means moving the hand away from the home row a lot. I wanted to be able to program and maintain my hands in a more or less touch typing position.The goal was improved speed at programming and less discomfort. The fact that I daily program on both windows and linux ( both native and via the cygwin X server) made things a bit more complex than anticipated, as we will see. <!--more-->This article tackles re-mapping the caps-lock key in windows and creating a new keyboard layout in both windows and linux (Xorg that is). Info about re-mapping the caps-lock key under linux is just a <a href="//http://www.google.com/search?q=xmodmap+caps+alt_gr">google search away</a>.

The following setup was used in this little adventure:
<ul>
	<li>Windows XP running <a href="http://www.cygwin.com/">Cygwin</a>.</li>
	<li>Ubuntu 9.04 (as X client only)</li>
	<li>Xorg server 1.5.7 with Xkb packages running in cygwin.</li>
</ul>

### Caps lock remapping
The caps lock key is irritating and I've never used as far as I can tell. But I haven't gotten around to doing anything about it. Now's the time. First I thought about remapping it to control and binding a lot the characters I want more accessible to <kbd>ctrl</kbd> bindings. This messes with application shortcuts a lot so I went for <kbd>altGr</kbd> instead. I used a small program named <a href="http://webpages.charter.net/krumsick/">KeyTweak</a> to perform the binding. The result of running that program is that i new value is written to the registry. It looks like this:

```bash
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]

"Scancode Map"=hex:00,00,00,00,00,00,00,00,02,00,00,00,38,e0,3a,00,00,00,00,00
```
{: class="full-bleed"}

Either apply the file or do it from within KeyTweak and the caps lock key is now an AltGr key. A reboot is probably in order to put it into effect. It is windows, after all.

### Keyboard layout for windows
I used a Microsoft tool called <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=8be579aa-780d-4253-9e0a-e17e51db2223&amp;DisplayLang=en">Microsoft Keyboard Layout Creator</a> which is a nice tool for creating a new layout from scratch or basing it on an existing layout. It has some limitations however in that you can't remap things like caps lock and the windows key. But on the other hand it generates nice install packages for your keyboard layout. I decided on the following keyboard shortcuts (remember caps lock is now <kbd>AltGr</kbd> so it is easily available for the left pinky finger):

```bash
	AltGr+a = !
	AltGr+s = #
	AltGr+d = @
	AltGr+f = $
	AltGr+g = (
	AltGr+h = )
	AltGr+j = /
	AltGr+k = \
	AltGr+l = ~
	AltGr+&oslash; = =
	AltGr+&aelig; = +
	AltGr+u = {
	AltGr+i = [
	AltGr+o = ]
	AltGr+p = }
```
{: class="full-bleed"}

### Keyboard layout for linux/ Xorg
When applying the custom layout for windows this worked well for native windows apps, but when logging into the linux servers and X-forwarding apps to the cygwin X server, it naturally didn't work. A similar custom keyboard layout for the X server was needed.

I found a great <a href="http://hektor.umcs.lublin.pl/~mikosmul/computing/articles/custom-keyboard-layouts-xkb.html">detailed guide</a> on creating keyboad layouts for X11/Xorg with XKB. There are some steps involved:
<ol>
	<li>Copy the layout you want to base you new layout on to a new file in /usr/share/X11/xkb/symbols.</li>
	<li>Tweak it to your liking.</li>
	<li>Add it to the list of supported keyboard layouts in /usr/share/X11/xkb/rules/xfree86.lst</li>
	<li>Restart your X server and use <code>setxkbmap</code> to set it, or add it in xorg.conf</li>
</ol>
The interesting parts of the symbols file looks like this:

```bash
key { [	u,	U,	braceleft,	uparrow ] };
key { [	i,	I, 	bracketleft,	idotless ] };
key { [	o,	O,	bracketright,	Ooblique ] };
```
{: class="full-bleed"}

This snippet maps e.g. <kbd>AltGr+u</kbd> to braceleft which displays a nice left curly brace.
The format is broken down like this:
<ul>
	<li>The key name AD07 is the 7th (07) alphanumeric (A) key from the left of the fourth row (D) from the bottom. Bottom row is A, second to bottom B and so on.</li>
	<li>First column is character displayed when the key is pressed normally</li>
	<li>Second column is character displayed when the key is pressed with shift down</li>
	<li>Third column is character displayed when <kbd>AltGr</kbd> is down</li>
	<li>Fourth column is character displayed when both <kbd>AltGr</kbd> and shift is down</li>
</ul>
Key names can be found in <code>/usr/X11/include/X11/keysymdef.h</code>

The keyboard layout is exactly the same as for windows and I just based it on the standard Norwegian layout and called it progn (<a href="http://www.franz.com/support/documentation/current/ansicl/dictentr/progn.htm">pun intented</a>). The entire progn keyboard symbols file is available <a href="http://knuthaugen.no/blog/media/progn">for download</a>. So now I have remapped the keyboard to my liking in both Linux and windows. I'll probably tweak the keymappings a bit after some use, but generally I'm very happy with them.
<br/>
<strong>References:</strong>
<ul>
	<li><a href="http://www.cygwin.com/">http://www.cygwin.com/</a></li>
	<li><a href="http://hektor.umcs.lublin.pl/~mikosmul/computing/articles/custom-keyboard-layouts-xkb.html">http://hektor.umcs.lublin.pl/~mikosmul/computing/articles/custom-keyboard-layouts-xkb.html</a></li>
	<li><a href="http://webpages.charter.net/krumsick/">http://webpages.charter.net/krumsick/</a></li>
	<li><a href="http://vlaurie.com/computers2/Articles/remap-keyboard.htm">http://vlaurie.com/computers2/Articles/remap-keyboard.htm</a></li>
</ul> 
