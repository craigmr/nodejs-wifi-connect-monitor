(function(){
    'use strict';
    //var io = require('socket.io')();

    var DeviceMonitor = require('./lib/monitor.js');
    var monitor = new DeviceMonitor('http://192.168.1.254/xslt?PAGE=C_2_0');
    monitor.start();

    monitor.on(DeviceMonitor.START, function onDeviceStart(devices){
        console.log('Monitor Starting');
    });

    monitor.on(DeviceMonitor.ADD, function onDeviceAdd(device){
        console.log('Device added:');
        console.log(device);
    });

    monitor.on(DeviceMonitor.REMOVE, function onDeviceRemove(device){
        console.log('Device removed:');
        console.log(device);
    });
})();
