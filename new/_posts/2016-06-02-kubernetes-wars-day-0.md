---
layout: post
title: "The Kubernetes Wars: Day 0"
published: true
tags: [Kubernetes, Devops, Ops, Skydns, Docker]
---

#### Other post in the series

- [Kubernetes Wars Day 3](/2016/06/kubernetes-wars-day-3.html)
- [Kubernetes Wars Day 7](/2016/06/kubernetes-wars-day-7.html)
- [Kubernetes Wars Day 34](/2016/12/the-kubernetes-wars-day-34.html)

_Operation k8s log, day 0 1100 Zulu_

So, we are sent out on a mission to deploy Kubernetes in our data centers, Google wrote it, management want it and the ops guys are gagging for it. And we have no choice but to follow orders and start using the damn thing.

So what is this beast we are about to tackle? Anything like running 15-node elasticsearch clusters with bad sharding policies and crappy index patterns? Or as bad as trying to make sense of an apache cassandra cluster without knowing much about native american tribes? Well, we are about to find out.

We have been running docker containers in production for a while now, and ops complained about lack of control on resources and limits and developers complained about lack of orchestration and scheduling. After a small firefight with the sales department on docker.com, who tried their probably-best-but-not-so-very-good to sell us some enterprisey stuff, along came kubernetes as the most likeley bogey we had to face.

## So What is Kubernetes?

[Kubernetes](http://kubernetes.io) is container orchestration, deployment, management and scaling, simply put. And boy can it do a lot for you. Take the kubectl cli, with its 48 commands and a grand total of 22 shared command line options and about 10-12 options _per command_ it's a whopper of a system. So what to do?

Bash, of course.

Write bash (or any other scripting language) to abstract away the forest of options you need for _every_ command, like cluster (one per data center, more on that later) and namespace (more on that too), object name to operate on and so on. You will need an abstraction. I also wanted to fit k8s deployment and management into existing scripts dealing with both straight docker and old school native servers so a separate set of k8s scripts was born. I opted for one per command instead of the k8s style with one big ass one with a million options, because that's how I roll.

## Namespaces, Clusters and stuff

Kubernetes docs says to be vary about multi location clusters so we opted for one cluster per data center, three in total. This gives a bit of overhead when it comes to deployment (we can't deploy in one big batch, but need three deploys to update all pods) but at the same time we can take a whole data center offline and upgrade the cluster without affecting the other two, which is nice.

Another thing we discovered was that kubernetes by default make configuration and variables available to all containers in a namespace and everyone could see everything when all apps were deployed in the default namespace. So we namespace all our apps into a separate namespace named after the app. As longs as all commands are namespaced (hence wrapper scripts) there is not much hassle. For snapshot and test environments, we use one cluster and not three to keep things simpler.

## Scripts, scripts and more scripts

We'll cover all the scripts in later blog posts, but let's start. I asked myself the question: what information about a running app do I need to get out of kubernetes most often? In our older stacks, we have hade a ping command which pinged the in-app ping endpoints and gave us a lot of information: where the app is running, what version it is running and which port. Could I get this from kubernetes?

The result was actually two scripts.

**k8sstatus APP ENV** gives you this:

<style> code.language-bash { font-size: 65% }</style>

{% highlight bash %}
osl2:
NAME DESIRED CURRENT AGE CONTAINER(S) IMAGE(S) SELECTOR
manifesto 1 1 44d manifesto dr.api.no/amedia/manifesto:0.0.3 name=manifesto
NAME READY STATUS RESTARTS AGE NODE
manifesto-lxf9x 1/1 Running 3 15d docker006-osl2

---

osl3:
NAME DESIRED CURRENT AGE CONTAINER(S) IMAGE(S) SELECTOR
manifesto 1 1 44d manifesto dr.api.no/amedia/manifesto:0.0.3 name=manifesto
NAME READY STATUS RESTARTS AGE NODE
manifesto-uwu4l 1/1 Running 0 2d docker009-osl3

---

ksd1:
NAME DESIRED CURRENT AGE CONTAINER(S) IMAGE(S) SELECTOR
manifesto 1 1 44d manifesto dr.api.no/amedia/manifesto:0.0.3 name=manifesto
NAME READY STATUS RESTARTS AGE NODE
manifesto-8q4f7 1/1 Running 0 16d docker008-ksd1

---

{% endhighlight %}

{% highlight bash %}
!/bin/bash

kubectl="/usr/local/bin/kubectl"
kube_opt="--kubeconfig=/etc/kubernetes/config"

if [ -z $1 ]; then
echo "usage: k8sstatus APP ENV"
echo "Display status for an app, both Replication controller and pods"
exit 1
fi

app=$1

if [ ! -z $2 ]; then
env=$2
fi

function list_pods() {
app=$1
cluster=$2
namespace=$3

    ${kubectl} ${kube_opt} get pods --cluster=${cluster} --namespace=${namespace} -o wide
    echo "-----------------------------------"

}

#default is prod
if [[-z ${env} || ${env} == prod*]]; then
namespace=${app}
    echo "osl2: "
    ${kubectl} ${kube_opt} get rc --cluster=osl2 --namespace=${namespace} ${app} -o wide
list_pods ${app} osl2 ${namespace}

    echo "osl3: "
    ${kubectl} ${kube_opt} get rc --cluster=osl3 --namespace=${namespace} ${app} -o wide
    list_pods ${app} osl3 ${namespace}

    echo "ksd1: "
    ${kubectl} ${kube_opt} get rc --cluster=ksd1 --namespace=${namespace} ${app} -o wide
    list_pods ${app} ksd1 ${namespace}

elif [ ${env} == "test" ]; then
namespace=${app}
    ${kubectl} ${kube_opt} get rc --cluster=test --namespace=${namespace} ${app} -o wide
    list_pods ${app} test ${namespace}
else
    namespace="${app}-${env}"
    ${kubectl} ${kube_opt} get rc --cluster=snapshot --namespace=${namespace} ${app} -o wide
list_pods ${app} snapshot ${namespace}
fi
{% endhighlight %}

Which tells us first the status of the Replication Controller for the app (and the version) and then iterates through all pods for this RC and shows where these are running and status for them. What this doesn't tell us, is the actual reply from the ping endpoint in the app, and not which IP it is running on (not always needed in kubernetes, but nice to test against when debugging. Thus k8sping was born.

{% highlight bash %}
k8sping manifesto prod
http://10.30.6.7:9644/manifesto/apiadmin/ping OK 0.0.3 master-undefined
http://10.31.9.9:9644/manifesto/apiadmin/ping OK 0.0.3 master-undefined
http://10.29.8.13:9644/manifesto/apiadmin/ping OK 0.0.3 master-undefined
{% endhighlight %}

And whammo, port and ip for the individual pods, and the return value from the ping endpoint.

Source:

{% highlight bash %}
#!/bin/bash

kubectl="/usr/local/bin/kubectl"
kube_opt="--kubeconfig=/etc/kubernetes/config"

if [ -z $1 ]; then
echo "usage: k8sping APP ENV"
echo "Ping application ping endpoint the pods, all instances."
exit 1
fi

app=$1
env=$2

port=$(port_for_app $app)

#echo "Deploying $app $version on jump.api.no"

function ping_app() {
local dc=$1
local app=$2

    IFS=$'\n'
    ips=($(${kubectl} ${kube_opt} get pods --cluster=${dc} --namespace=${namespace} -o yaml | grep -i podip | cut -f2 -d: | sed 's/\s//g'))
    for ip in "${ips[@]}"; do
        value=$(curl -s http://${ip}:${port}/${app}/apiadmin/ping)
        echo "http://${ip}:${port}/${app}/apiadmin/ping ${value}"
    done

}

if [[${env} == prod*]]; then
namespace=${app}
    for dc in osl2 osl3 ksd1; do
        ping_app ${dc} ${app}
    done
elif [ ${env} == "test" ]; then
    namespace=${app}
ping_app ${env} ${app}
else
    namespace="${app}-${env}"
ping_app snapshot ${app}
fi
{% endhighlight %}

Kubectl command output is a joy to parse. Everything (well, almost everything) makes sense.

That's enough for one day, this is Gordon, signing off :-)

_End log Operation k8s, day 0_
