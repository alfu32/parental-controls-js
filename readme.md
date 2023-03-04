# About
**Parentalcontrols** is a application that counts :
 - the usage/uptime minutes of specified applications.
 - the total system uptime
 - if the system was up outside the allowed hours
Parental COntrols will pop up user notifications when:
 - there is a violation of the limits configured in config.json
 - 10, 5 and 1 minute before the allowed time for an application or for the system uptime is about to expire

The parental controls ui is a SPA that basically will let you :
 - modify config.json in visual mode
 - visualise the current daily application usage
 - manage processes and windows on the target machine.

The service will never block/throttle processes nor will it shutdown the computer automatically. It provides however APIs and user interface funtions/buttons for the administrator to perform these operations manually if the need arises. 

# Components
## Systemd Service

## Installation

clone this repository

```bash
git clone https://github.com/alfu32/parental-controls-js.git

cd parental-controls-js
```

switch to the next branch

```bash
git checkout next
```

build

```bash
./scripts/build.sh <target-username> <admin/sudo-username> <architecture-vendor-ostype>
```

for the last parameters you only have four choices : 
 - `x86_64-unknown-linux-gnu` for linux
 - `x86_64-pc-windows-msvc` for windows 
 - `x86_64-apple-darwin` for intel-macs
 - `aarch64-apple-darwin` for apple-silicon macs


deploy on the local machine

```bash

./scripts/deploy-local.sh <target-username> <admin/sudo-username> <architecture-vendor-ostype>
cd $HOME/.parental-controls

## install the service
./parentalcontrols.service.install

```


The `parentalcontrols.service` tracks application uptime and aggregate it into a daily report.
### config.json
The service configuration is stored inside the config.json file:
The file contains the following specifiers:
    - for each day of the week (Sunday to Saturday) the allowed hours and the number of allowed minutes
    - a list of application to track

The tracking configuration for one application specifies a number of minutes that an app is allowed to be up, an unique id of the tracker, and a regex expression to be matched against the application launch command.

## User Interface
