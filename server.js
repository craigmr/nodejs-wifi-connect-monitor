(function(){
    'use strict';
    var express = require('express');
    var app = express();
    var httpSer= app.listen(3030);

    var io = require('socket.io').listen(httpSer);

    //Setup logging to file and couchdb
    var winston = require('winston');
    var winstonCouch = require('winston-couchdb').Couchdb;

    winston.add(winston.transports.File, { filename: 'wifi-device.log' });
    winston.add(winstonCouch, {
        host: 'localhost',
        port: 5984,
        db: 'presence'
    });

    var DeviceMonitor = require('./lib/monitor.js');

    var monitor = new DeviceMonitor('http://192.168.1.254/xslt?PAGE=C_2_0');
    monitor.start();

    monitor.on(DeviceMonitor.START, function onDeviceStart(devices){
        winston.info('device monitoring starting', devices);
        io.sockets.emit('start', devices);
    });

    monitor.on(DeviceMonitor.END, function onMonitroEnd(){
        winston.info('device monitoring ending');
    });

    monitor.on(DeviceMonitor.ADD, function onDeviceAdd(device){
        winston.info('add', device);
        io.sockets.emit('add', device);
    });

    monitor.on(DeviceMonitor.REMOVE, function onDeviceRemove(device){
        winston.info('remove', device);
        io.sockets.emit('remove', device);
    });

    monitor.on(DeviceMonitor.ERROR, function onMonitorError(error){
        winston.error(error);
    });

    app.get('/devices', function(req, res){
        res.send(monitor.connectedDevices);
    });
})();
