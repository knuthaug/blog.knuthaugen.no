---
layout: post
title: "The Kubernetes Wars: Day 3"
published: true
tags: [Kubernetes,Devops,Ops,Skydns,Docker]
---

{% include JB/setup %}

#### Other post in the series

- [Kubernetes Wars Day 0](/2016/06/kubernetes-wars-day-0.html)
- [Kubernetes Wars Day 7](/2016/06/kubernetes-wars-day-7.html)
- [Kubernetes Wars Day 34](/2016/12/the-kubernetes-wars-day-34.html)

_Operation k8s log, day 3 1300 Zulu_

Day three and we have treated the wounded and regrouped after our initial encounter with the enemy.
There are yaks everywhere, get your razors ready, boys!

## Config

How to deal with configuration? Kubernetes likes app config in environment variables, not config files. This is easy in our node apps using convict, pretty easy in our ruby apps and ranging from relatively easy to bloody hard in our java apps. But how to get config into the replication controllers? We opted for using configmaps (a kubernetes object) to store the config, reference the variables from the rc files and maintain it in git controlled files. So when we want to change to app config, update the config files and run a script which updates the configmap and reloads all the pods for the app. Incidentally, the way we do that, is to delete them, and let kubernetes recreate them. Don't do this if you run one cluster ;-) We _should_ make the apps read the config automatically, but since none our apps do that, we needed a solution that works now.

This also means we can have separate config for different environments while the file definition of the RC remains the same. We started out with only the configuration variables external to the RC file, but soon realized we needed to externalize the version of the image, the replica number and the limits too.

This has worked really well so far.

The deploy script which either creates everything on the first deploy (from yaml files) or performs a rolling upgrade from one version to another. The deploy script also need to handle the configmap and substituting the values from external files.

<style> code.language-bash { font-size: 70% }</style>

````bash
#!/bin/bash

. /usr/local/amedia-tools/dev/dev_functions.sh
yaml_dir="/usr/local/k8s-files"
kubectl="/usr/local/bin/kubectl"
kube_opt="--kubeconfig=/etc/kubernetes/config"

if [ $# -lt 2 ]; then
    echo "usage: k8sdeploy APP ENV [VERSION]"
    echo "Deploy a new version of an app to the specified environment. In production, one cluster at a time."
  exit 1
fi

app=$1
env=$2

if [ ! -z $3 ]; then
   version=$3
fi

if [ ${env} == "prod" ]; then
    env="production"
fi

if [[ ${env} == snap* ]]; then
    namespace="${app}-${env}"
else
    namespace=${app}
fi

function deploy_from_file() {
    dc=$1

    line=$(${kubectl} ${kube_opt} get --cluster=${dc} --namespace=${namespace} rc $app 2>&1)
    if [[ $line != Error* ]]; then
        warnlog "RC for ${app} already exist, will not try to re-create from yaml files again"
        exit 1
    fi

    if [ -d $yaml_dir/$app ]; then
        ${kubectl} ${kube_opt} create namespace ${namespace} --cluster=${dc}
        ${kubectl} ${kube_opt} create --namespace=${namespace} --cluster=${dc} -f ${configmap_file}
        ${kubectl} ${kube_opt} create --cluster=${dc} --namespace=${namespace} -f $yaml_dir/$app/$app-svc.yaml

        #before we create the rc, expand variables from resources file
        #make a tmp file for the newly generated rc file
        rcfile=$(expand_placeholders_from_resources ${app}-rc.yaml ${yaml_dir}/${app} ${env})

        ${kubectl} ${kube_opt} create --cluster=${dc} --namespace=${namespace} -f ${rcfile}

        #if test or snapshot, scale down to 1 replica
        if [ ${env} != "production" ]; then
            ${kubectl} ${kube_opt} scale --cluster=${dc} --namespace=${namespace} --replicas=1 rc ${app}
        fi
    else
        errlog "Could not find yaml files for app $app in $yaml_dir/$app"
        exit 1
    fi
}

function rolling_update() {
    #check if the service is there
    local dc=$1
    local app=$2
    local env=$3

    line=$(${kubectl} ${kube_opt} get --cluster=${dc} --namespace=${namespace} rc $app 2>&1)
    if [[ $line == Error* ]]; then
        deploy_from_file $dc
    else
        #update configmap first
        out=$( ${kubectl} ${kube_opt} delete configmap config --namespace=${namespace} --cluster=${dc})
        out=$( ${kubectl} ${kube_opt} create --namespace=${namespace} --cluster=${dc} -f ${configmap_file})

        if [ $? != 0 ]; then
            errlog "Error occured when refreshing configmap for app. See error below"
            echo $out
            exit 1
        fi

        ${kubectl} ${kube_opt} rolling-update $app --namespace=${namespace} --update-period=1s --poll-interval=2s --timeout=2m --cluster=${dc} --image=dr.api.no/amedia/$app:$version

        #if successful, patch resource file with new image version
        if [ $? == 0 ]; then
            image=$(${kubectl} ${kube_opt} get --namespace=${namespace} --cluster=${dc} rc ${app} -o yaml | grep "image:" | tr -d "\t " | cut -f2-3 -d:)
            #patch image version into resources file
            patch_file ${yaml_dir}/${app}/${env}.resources ${app} "image" ${image}
        else
            errlog "Rolling-update failed. Inspect the status of the app with k8sstatus ${app} ${env} and dig from there"
            exit 1
        fi
    fi
}

#update k8s-files repo
cd $yaml_dir
git pull

if [ $? != 0 ]; then
    errlog "Could not pull the k8s-files repo. Please check permissions on jump.api.no:/usr/local/k8s-files"
    exit 1
fi

cd - > /dev/null 2>&1

#generate configmap
configmap_file=$(generate_configmap_file ${yaml_dir} ${namespace} ${app} ${env})

if [ ! -z "$version" ]; then
    if [[ $env == prod* ]]; then
        for dc in osl2 osl3 ksd1; do
            rolling_update $dc $app $env
        done
    elif [ ${env} == "test" ]; then
        rolling_update $env $app $env
    else
        rolling_update snapshot $app $env
    fi
else
    #first deploy, we need the yaml
    if [[ $env == prod* ]]; then
        deploy_from_file osl2
        deploy_from_file osl3
        deploy_from_file ksd1
    elif [ ${env} == "test" ]; then
        deploy_from_file $env
    else
        deploy_from_file snapshot
    fi
fi

report_deploy $env $app $version
```

And then the script for _just_ updating the config of an app, without deploying anything.

```bash
```bash

. /usr/local/amedia-tools/dev/dev_functions.sh
yaml_dir="/usr/local/k8s-files"
kubectl=/usr/local/bin/kubectl
kube_opt="--kubeconfig=/etc/kubernetes/config"

if [ -z $1 ]; then
    echo "usage: k8sconfig APP ENV"
    echo "Update the config for an application. This script will pull k8s-files, convernt the env.properties file to a kubernetes configmap, and restart all pods to read the new config."
    exit 1
fi

app=$1
env=$2
port=$(port_for_app $app)

if [ $env == "prod" ]; then
    env="production"
fi

if [[ ${env} == snap* ]]; then
    namespace="${app}-${env}"
else
    namespace=${app}
fi


function create_config_from_etcd() {
    dc=$1
    env=$2

    out=$(${kubectl} ${kube_opt} get --namespace=${namespace} --cluster=${dc} configmap config 2>&1)

    if [[ ${out} != Error* ]]; then
        #config map is there, delete it and recreate
        ${kubectl} ${kube_opt} delete configmap config --namespace=${namespace} --cluster=${dc}
    fi

    ${kubectl} ${kube_opt} create --namespace=${namespace} --cluster=${dc} -f ${configmap_file}

    if [[ $? != 0 ]]; then
        errlog "Something bad happened and we could not create configmap. Aborting restart"
        exit 1
    fi

    #do a replace on the rc, to accomodate for new variables in the yaml
    # first, patch the rc file to the latest (running version)
    image=$(${kubectl} ${kube_opt} get --namespace=${namespace} --cluster=${dc} rc ${app} -o yaml | grep "image:" | tr -d "\t " | cut -f2-3 -d:)

    #patch image version into resources file
    patch_file ${yaml_dir}/${app}/${env}.resources ${app} "image" ${image}

    #make a tmp file for the newly generated rc file
    rcfile=$(expand_placeholders_from_resources ${app}-rc.yaml ${yaml_dir}/${app} ${env})

    ${kubectl} ${kube_opt} replace --namespace=${namespace} --cluster=${dc} -f ${rcfile}
    rm ${rcfile}

    #if test or snapshot, scale down to 1 replica
    if [ ${env} != "production" ]; then
        ${kubectl} ${kube_opt} scale --cluster=${dc} --namespace=${namespace} --replicas=1 rc ${app}
    fi

    # delete existing pods, to recreate and read new config
    had_num=$( ${kubectl} ${kube_opt} get pods --cluster=${dc} --namespace=${namespace} -o yaml | grep -i podip | cut -f2 -d: | wc -l)
    infolog "stopping running pod instance(s) in cluster=${dc} (${had_num} instance(s) found running)"
    ${kubectl} ${kube_opt} delete --namespace=${namespace} --cluster=${dc} --all pod

    echo -ne "[${BOLD}${INFO_STYLE}INFO${RESET}]\tChecking if they are back up (checking in intervals, max 150s): "
    i=1
    END=10
    are_pods_up ${app} ${port} ${had_num} ${dc} ${namespace}
    status=$?

    while [[ $i -le $END && ${status} -eq 0 ]]; do
        ((i = i + 1))
        if [ $i -gt 5 ]; then
            echo -n "."
            sleep 20s
        else
            echo -n "."
            sleep 10s
        fi
        are_pods_up ${app} ${port} ${had_num} ${dc} ${namespace}
        status=$?
    done

    # still on status 0 means end of loop but instance not up ag
    if [ $status -eq 0 ]; then
        errlog "Error: Pods seem unable to restart. Please check their status in ${dc} manually. We need ${had_num} running per server center. Found ${num} running instances"
        exit 1
    else
        echo "Yay! Back up."
    fi
}

#we need the yaml
cd ${yaml_dir}
git pull

if [ $? != 0 ]; then
    errlog "Could not pull the k8s-files repo. Please check permissions on jump.api.no:/usr/local/k8s-files"
    exit 1
fi

cd - > /dev/null 2>&1

configmap_file=$(generate_configmap_file ${yaml_dir} ${namespace} ${app} ${env})

if [[ $env == prod* ]]; then
    create_config_from_etcd osl2 ${env}
    create_config_from_etcd osl3 ${env}
    create_config_from_etcd ksd1 ${env}
elif [ ${env} == "test" ]; then
    create_config_from_etcd $env ${env}
else
    create_config_from_etcd snapshot ${env}
fi

rm ${configmap_file}

```

(Yeah, it could do with some refactoring)

Container Metrics
--------------------

The question that popped up was: when do we know the cluster is running out of resources, and preferably _before_ the deploy fails with events saying you're shit out of memory or cpu? Container metrics to the rescue.

We have a existing metric system backed in graphite which has worked well for us. We have used the host name as the metric path to give us the oppurtunity to isolate metrics per host. When kubernetes manages the containers, the host on which it runs becomes ever changing. to solve this, we landed on using [heapster](https://github.com/kubernetes/heapster) for gathering container metrics, and then storing them in [influxdb](https://influxdata.com/). The influx query language gives easy ways to abstract away over changing host names. I am seeing use of influxdb for app metrics in the future too, for the same reason.

Next time on the kubernetes wars: the curious case of the slow node apps.

_End log Operation k8s, day 3_
````
