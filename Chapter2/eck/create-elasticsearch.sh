#!/bin/bash
cat <<EOF | kubectl apply -f -
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: my-cluster
spec:
  version: 7.10.1
  nodeSets:
  - name: default
    count: 3
    config:
      node.store.allow_mmap: false
EOF