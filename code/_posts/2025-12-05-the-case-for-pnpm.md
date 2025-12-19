---
layout: post
title: "The Case for pnpm"
published: true
tags: []
category: code
---

If you're one of those unlucky souls that need permission or backing to choose something else than `npm` as your JavaScript package management tool, this article is for you. My [previous post](/code/2025/11/28/living-with-deep-dependency-structures.html) was on how to try to deal with a huge dependency tree in these uncertain times. And it occurs to me that many (not all) of those problems are made much smaller by just switching to [pnpm](https://pnpm.io). So here are some reasons for choosing pnpm over npm that _I_ choose to prioritise. Your context may be different than mine, of course YMMV. 

I'm old enough to be lucky/unlucky enough to have earned a living writing Perl and one of the cool things with Perl was [DWIM](https://en.wikipedia.org/wiki/DWIM) (Do what I Mean) which when you have experienced it, you notice it really fast when it isn't there. And I hate that!

And `pnpm` has, for me, a much higher DWIM-factor than `npm` and `yarn`. We are on the same page, `pnpm` and I, we _complete_ each other 😍

There is a nice [feature comparison list](https://pnpm.io/feature-comparison) which is a good start. But I also want to talk about some configuration options that can make your life easier. 

### The Security

Moving to more security related stuff, we have these bad boys:

- Pnpm disables post-install scripts completely as a default, but rather gives you the option to enable the ones you trust. Many of the latest supply chain attacks have been using post-install scripts as the attack vector.  
- Configuration option for `minimumReleaseAge` to block installation of packages younger than this age, to give the ecosystem some time to remove bad packages. Also `minimumReleaseAgeExclude` to exclude your own packages or other ones you trust. 
- Configuration options for `trustPolicy` which, when set to `no-downgrade` will refuse to install updates where the security level has been lowered compared to the previous version, looking at things like package provenance and publisher trust. There's also an `trustPolicyExclude` to go with that. 

### The Niceties

- It's fast. Faster than both yarn and npm last time I tried them (which to be fair is while ago, but give it a spin and compare). First installs are fast, repeat installs when checking what needs to be done is _very_ fast. See [motivation for pnpm](https://pnpm.io/motivation) for details. 
- Excellent workspace/monorepo support.
- None of that silly "you need to remember to type `run` before a command or I won't run it". Just type the command and pnpm just does what you mean. 
- Super-duper filtering of workspaces/packages for command. 
- The lock file is easier to read than npm 😆
- `install` automatically resolves and fixes your lockfile if a merge  generated a merge conflict. It's the little things. 
- Easy config of multiple or centralised lockfiles for monorepos. 
- An isolated node_modules directory with packages linked from  centralised store with symlinks is the default, instead of a hoisted (one big directory at the top) one, which npm uses as a default. A Hoisted one is available if you should choose that. But I wouldn't if I were you. You save disk space with the central package store too. 
- It can manage the versions of itself that is run! If you open up a repo that specifies a different version of `pnpm` in the `engines` property, it will download and run that version.  
- Really good documentation and a _lot_ of configuration options. 
- Easy to setup tab completion.
- Active development and frequent releases. 

