PUT _index_template/web-logs
{
  "index_patterns": ["ilm-web-logs*"], 
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy ", 
      "index.lifecycle.rollover_alias": "ilm-web-logs" 
    }
  }
}
