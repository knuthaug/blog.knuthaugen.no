---
layout: post
title: "A Usable and Robust Private Npm Repo"
published: true
tags: [npm, devops, node.js]
---

Since we started using a node.js stack in Amedia we have gone through several generations of private npm repos. And since we finally have found a model that acutally works I thought I'd share it.

Our main reason for having a private npm repo is to be able to deploy and work without being dependant on the global repo. We follow this model for all our app stacks (using nexus for java, private gem server for ruby). We also have internal node modules shared between applications which we won't publish to global repo because of, ehm, reasons. All repo managers go down, and you can bet they will go down when it least fits you. Been there done that. And the long haul network latency can be a pain too.

### First version: replicating couchdb repo

The first repo we set up was following the "standard" guide of using couchdb and the [couchapp](https://github.com/npm/npm-registry-couchapp) that runs the global repo. And what a total disaster it was. The replication was growing in size more or less by the minute by node.js hackers reinventing every wheel they can lay there eyes on. Granted, starting out with too small disks was my bad, but worse was also that couch was unstable and the replication thread was spontanously dying on us and not tell a soul about it. Suddenly the repo was out ouf date or just down. Not much better than using the global repo, actually worse at times. Granted, this was on an earlier version of couchdb, but it caused a lot of pain.

### Second version: reggie

Then we found [reggie](https://github.com/mbrevoort/node-reggie) as a lighweight, filebased alternative. It used a separate client for publishing and version specs in package.json used a different syntax than normal, but it was stable and usable. Reggie would only hold our internal packages so we returned to using the global repo for public packages. But then npm inc. happened and with that a lot of changes came into npm. Reggie was abandoned by its authors and soon became incompatible with newer node/npm versions. So what to do now?

### Three's a charm

After reading about the setup at [Finn](http://www.finn.no/) but short on details I set out to stitch something together. By this I had testet using [npm_lazy](https://github.com/mixu/npm_lazy) as a caching proxy for registry.npmjs.org, to avoid downtime and latency, and that worked well. To work around the (major) deficiency in npm, with only support for one repo, I used [Kappa](https://github.com/krakenjs/kappa) as the repo software. Kappe pointed to two backends, a npm repo couchapp running in a recent couchdb as the first (for writing and holding our internal packages) and npm_lazy as the second, acting as a caching proxy between us and registry.npmjs.org. A bonus is that we now use the exact same syntax as global packages and use npm for publishing.

And since this baby came into production, I can't recall a single error or minute of downtime for it.

That makes me a happy camper.
