(function(){
    'use strict';

    var events = require('events');
    var util = require('util');
    var NetworkMonitor = require('./monitor');

    function NetworkMonitorClient(socket){
        this.trackedDevices = {};

        socket.on('add', function onDeviceAdd(device){
            if(this.isTracked(device.mac)){
                console.log('Tracked device added');

                device.nickname = this.trackerDevices[device.mac];
                this.emit('add', device);
            }
        }.bind(this));

        socket.on('remove', function onDeviceRemove(device){
            if(this.isTracked(device.mac)){
                console.log('Tracked device remove');

                device.nickname = this.trackerDevices[device.mac];
                this.emit('remove', device);
            }
        }.bind(this));
    }

    util.inherits(NetworkMonitorClient, events.EventEmitter);

    NetworkMonitorClient.prototype.add = function(mac, name){
        trackedDevices[mac] = name;
    };

    NetworkMonitorClient.prototype.remove = function(mac){
        trackedDevices[mac] = null;
        delete trackerDevices[mac];
    };

    NetworkMonitorClient.prototype.isTracked = function(mac){
        return (mac in trackedDevices);
    };

    modules.exports = exports = NetworkMonitorClient;
})();
