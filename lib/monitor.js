(function(){
    'use strict';
    var events = require('events');
    var util = require('util');
    var request = require('request');
    var cheerio = require('cheerio');

    var POLL_TIME = 30000;

    function diff(a, b){
        var hash = {};
        b.forEach(function(device){
            hash[device.mac] = device;
        });

        return a.filter(function(device){
            return !(device.mac in hash);
        });
    }

    function NetworkMonitor(routerURL){
        this.connectedDevices = undefined;
        this.url = routerURL;
        this._ignore = {};
    }

    NetworkMonitor.START     = 'start';
    NetworkMonitor.END       = 'end';
    NetworkMonitor.UPDATE    = 'update';
    NetworkMonitor.ADD       = 'add';
    NetworkMonitor.REMOVE    = 'remove';
    NetworkMonitor.ERROR     = 'error';

    util.inherits(NetworkMonitor, events.EventEmitter);

    NetworkMonitor.prototype.start = function(){
        this._interval = setInterval(this.updateDevices.bind(this), POLL_TIME);
        this.updateDevices();

        this.on(NetworkMonitor.UPDATE, function onDeviceUpdate(devices){
            if(this.connectedDevices === undefined){
                this.connectedDevices = devices;
                this.emit(NetworkMonitor.START, devices);
                return;
            }

            var removed = diff(this.connectedDevices, devices);
            var added = diff(devices, this.connectedDevices);

            this.connectedDevices = devices;

            for(var i=0; i < removed.length; i++){
                this.emit(NetworkMonitor.REMOVE, removed[i]);
            }

            for(var j=0; j < added.length; j++){
                this.emit(NetworkMonitor.ADD, added[j]);
            }
        });
    };

    NetworkMonitor.prototype.ignore = function(mac){
        this._ignore[mac] =  true;
    };

    NetworkMonitor.prototype.stop = function(){
        clearInterval(this._interval);
        this.emit(NetworkMonitor.END);
    };

    NetworkMonitor.prototype.updateDevices = function(){
        var monitor = this;

        request(this.url, function onPageLoad(error, response, body){
            if(error){
                console.log(error);
                monitor.emit(NetworkMonitor.ERROR, error);
                return;
            }

            var $ = cheerio.load(body);
            var deviceRows = $('table', '#contents')
                                .eq(4)
                                .children( 'tr' );

            var newDevices = [];
            deviceRows.each(function(i, el){
                var $el = $(el);
                var tds = $el.children();
                var device;

                if(tds.eq(0).is('td')){
                    device = {
                        name: tds.eq(0).text(),
                        mac: tds.eq(2).text(),
                        ip: tds.eq(3).text()
                    };

                    if(!(device.mac in this._ignore)){
                        newDevices.push(device);
                    }
                }
            }.bind(this));
            monitor.emit(NetworkMonitor.UPDATE, newDevices);
        }.bind(this));
    };

    module.exports = exports = NetworkMonitor;
})();
