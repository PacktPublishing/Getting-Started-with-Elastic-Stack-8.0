# Notices

This document lists post publishing notices for content in [Getting Started with Elastic Stack 8](https://www.elasticstackbook.com). 

## 1. Elastic Cloud on Kubernetes (ECK) and licensing

**Date published:** 27 April 2022

**Type:** Correction

**Chapter**: 2

**Page**: 59

**Description:** The book notes that "ECK is a paid subscription feature offered by Elastic". It should be noted that select ECK features are also available for free under the ["Basic" Elastic license](https://www.elastic.co/subscriptions).


## 2. Ingest pipeline to enrich documents on Elasticsearch

**Date published:** 27 April 2022

**Type:** Bug

**Chapter:** 4

**Page:** 140

**Description:** The ingest pipeline code to enrich documents contains a minor bug. The enrich processor overwrites original sensor information with enriched fields. The `target_field` parameter in the pipeline should be updated to `sensor.meta` instead of `sensor` to avoid this behaviour. This helps retain original document data post enrichment.

The code for this pipeline has been [updated](Chapter4/ingest-pipelines/pipeline-6.json).