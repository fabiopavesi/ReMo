# ReMo
A reactive server monitoring system

This simple project is a [Node.js](https://nodejs.org/it/) **centralised server monitoring** system written in [Typescript](https://github.com/Microsoft/TypeScript), with a **distributed reactive mechanism**.
All communication among nodes is obtained via [MQTT](http://mqtt.org).
User alerting uses a [Telegram](https://telegram.org) BOT.

## Installation
Installation is the same on the monitoring server and on the monitored ones.
* clone this repository
* enter local repo directory
* run *npm install*
* run *npm install --global*
* create a */etc/monitor-config.json* file and insert the following JSON:
    ```json
      {
        "clientId": "client",
        "serverId": "server",
        "serverListPath": "/etc/server-list.json",
        "serviceListPath": "/etc/service-list.json",
        "telegramToken": "<your token here>",
        "telegramChatId": -1,
        "mqttUrl": "mqtt://test.mosquitto.org:1883",
        "mqttBaseTopic": "server-monitor"
      }
    ```
* customise it with your own parameters

## Satellite configuration
Satellites need a *serviceListPath*, defined in the *monitor-config.json* file.
The structure of the service list is a JSON array with the following structure:
```json
[
  {
    "id": "Google",
    "url": "https://www.google.it/",
    "interval": 1,
    "restartCommand": "initctl restart <service name>"
  }
]
```
* **id** - id of the monitored service
* **url** - the URL to be monitored
* <font color="red">**interval** - unimplemented - desired interval between checks</font>
* **restartCommand** - linux command to be executed to restart the service in case it is found not responding
  
## Running
On the monitoring server:
    `sudo remo-server`

On each monitored server:
    `sudo remo-satellite`

