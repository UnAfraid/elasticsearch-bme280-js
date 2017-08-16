# Using BME280 sensor and Elastic Search as data store.

## Overview

This example shows how to use MongooseOS with bme280 and elastic-search.
Go to device configuration and specify elastic.url and elastic.headers.Authorization

```bash
mos config-set elastic.url=<YOUR_ELASTIC_URL>/<INDEX>/<TYPE> elastic.headers.Authorization="some hash/token here"
// Example
mos config-set elastic.url=http://elastic-search.local/sensors/bme280 elastic.headers.Authorization="asdf9asdf890asdfksadf89879789asdf"
```

## Nginx configuration
- Using nginx as reverse proxy for elastic-search to limit the exposure
```
map $http_Authorization $is_ok {
    default false;
    "some hash/token here" true;
    "asdf9asdf890asdfksadf89879789asdf" true;
}

server {
    listen            80;
    server_name       elastic-search.local;
    access_log        /var/log/nginx/$server_name-access.log;
    error_log         /var/log/nginx/elastic-search.local-error.log

    location / {
        if ($is_ok = false) {
            return 401;
        }

        proxy_pass    http://localhost:9200;
    }
}
```

## Elastic configuration
- Install Elastic Search
- Install Kibana
- Install X-Pack for Elastic Search (`/usr/share/elasticsearch/bin/elasticsearch-plugin install x-pack`)
- Install X-Pack for Kibana (`/usr/share/kibana/bin/kibana-plugin install x-pack`)
- Register your own license (https://register.elastic.co/)
- Install your own license (`curl -XPUT -u admin 'http://<host>:<port>/_license?acknowledge=true' -d @license.json`)
- Create index for data
- Create bme280 mapping (Go to kibana -> Dev Tools and paste this)
```
PUT /data/_mapping/bme280?update_all_types=true
{
  "properties": {
    "sensorData": {
      "properties": {
        "humidity": {
          "type": "float"
        },
        "pressure": {
          "type": "float"
        },
        "temperature": {
          "type": "float"
        }
      }
    },
    "updated": {
      "type": "date",
          "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
    }
  }
}
```

# Then you can start creating your own graphs that looks like this:
![Kibana](http://i.imgur.com/bJWlvtn.png)

## How to install this app

- Install and start [mos tool](https://mongoose-os.com/software.html)
- Switch to the Project page, find and import this app, build and flash it:

<p align="center">
  <img src="https://mongoose-os.com/images/app1.gif" width="75%">
</p>
