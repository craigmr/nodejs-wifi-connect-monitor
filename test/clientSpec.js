describe('NetworkMonitorClient', function(){
    'use strict';
    //Testing Framework
    var chai = require("chai");
    var sinon = require("sinon");
    var sinonChai = require("sinon-chai");
    var expect = chai.expect;
    chai.use(sinonChai);
    var events = require('events');

    var NetworkMonitorClient = require('../lib/monitor-client');
    var client, socket;

    beforeEach(function(){
        socket = new events.EventEmitter();
        client = new NetworkMonitorClient(socket);
    });

    describe('registering tracked devices', function(){
        it('add device', function(){
            expect(client.isTracked('0.0.0.0.0')).to.equal(false);
            client.addDevice('0.0.0.0.0', 'fake test device');
            expect(client.isTracked('0.0.0.0.0')).to.equal(true);
        });

        it('remove device', function(){
            client.addDevice('0.0.0.0.0', 'fake test device');
            expect(client.isTracked('0.0.0.0.0')).to.equal(true);
            client.removeDevice('0.0.0.0.0');
            expect(client.isTracked('0.0.0.0.0')).to.equal(false);
        });
    });

    describe('notifies of device events from server', function(){
        beforeEach(function(){
            client.addDevice('0.0.0.0', 'test device nickname');
        });

        it('fires add event for tracked device', function(){
            var onAdd = sinon.spy();
            client.on('add', onAdd);

            var device = {'mac':'0.0.0.0', 'name':'test device name'};
            socket.emit('add', device);

            expect(onAdd).to.have.been.calledWith(device);
            expect(device.nickname).to.equal('test device nickname');
        });

        it('fires remove event for tracked devices', function(){
            var onRemove = sinon.spy();
            client.on('remove', onRemove);

            var device = {'mac':'0.0.0.0', 'name':'test device name'};
            socket.emit('remove', device);

            expect(onRemove).to.have.been.calledWith(device);
            expect(device.nickname).to.equal('test device nickname');
        });

        it('ingores events from non tracked devices', function(){
            var onAdd = sinon.spy();
            var onRemove = sinon.spy();
            client.on('add', onAdd);
            client.on('remove', onRemove);

            var device = {'mac':'1.2.3.4', 'name':'test device name'};
            socket.emit('add', device);
            socket.emit('remove', device);

            var test = expect(onAdd).to.have.not.been.called;
            test = expect(onRemove).to.have.not.been.called;
        });
    });

    describe('ignores dispatching events during certain time', function(){
        it('set time in config', function(){

        });
    });
});
