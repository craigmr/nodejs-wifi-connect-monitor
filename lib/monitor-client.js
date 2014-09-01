(function(){
    'use strict';

    var events = require('events');
    var util = require('util');
    var NetworkMonitor = require('./monitor');

    function NetworkMonitorClient(socket, options){
        this.trackedDevices = {};

        socket.on(NetworkMonitor.ADD, function onDeviceAdded(device){
            if(this.isTracked(device.mac)){
                device.nickname = this.trackedDevices[device.mac];
                this.emit('add', device);
            }
        }.bind(this));

        socket.on(NetworkMonitor.REMOVE, function onDeviceRemoved(device){
            if(this.isTracked(device.mac)){
                device.nickname = this.trackedDevices[device.mac];
                this.emit('remove', device);
            }
        }.bind(this));
    }

    util.inherits(NetworkMonitorClient, events.EventEmitter);

    NetworkMonitorClient.prototype.addDevice = function(mac, name){
        this.trackedDevices[mac] = name;
    };

    NetworkMonitorClient.prototype.removeDevice = function(mac){
        this.trackedDevices[mac] = null;
        delete this.trackedDevices[mac];
    };

    NetworkMonitorClient.prototype.isTracked = function(mac){
        return (mac in this.trackedDevices);
    };

    module.exports = exports = NetworkMonitorClient;
})();
