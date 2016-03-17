'use strict';
var _            = require('lodash');
var util         = require('util');
var exec         = require('child_process').exec;
var debug        = require('debug')('meshblu-citrix-receiver');
var EventEmitter = require('events').EventEmitter;

var isWindows = process.platform === 'win32' || process.platform === 'win64';
var DEFAULT_RECEIVER_PATH;

if(isWindows){
  DEFAULT_RECEIVER_PATH = 'C:\\Program Files (x86)\\Citrix\\SelfServicePlugin\\SelfService.exe';
}else{
  DEFAULT_RECEIVER_PATH = '/Applications/Citrix\\ Receiver.app'
}

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    command: {
      type: 'string',
      required: true,
      enum : ['open-application', 'disconnectapps', 'poll' , 'logoff', 'reconnectapps'],
      default: 'open-application'
    },
    application: {
      type: 'array',
      items: {
        type: 'string'
      },
      required: false
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    receiverPath: {
      type: 'string',
      required: true,
      default: DEFAULT_RECEIVER_PATH
    }
  }
};

function Plugin(){
  this.options = this.setOptions({});
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload || {}
  var command = payload.command;
  var self = this;

  if(command === 'start-receiver' || command === 'open-application') {
    if(Array.isArray(payload.application)){
      payload.application.forEach(function(app){
        debug('Launching: ', app);
        self.openApplication(app);
      });
    }else{
      debug('Launching: ', payload.application);
      self.openApplication(payload.application);
    }
    return;
  }

  self.runCmd(command);
};

Plugin.prototype.runCmd = function(cmd) {
  var self, command;
  self = this;

  if(!isWindows) {
    self.emit('message', {devices: '*', topic: 'error', payload: {error: cmd + ' is only available for Windows'}});
    return;
  }

  command = '"' + self.options.receiverPath + '"';
  command += ' -' + cmd;
  debug('executing command', command);
  exec(command);
  return;
}

Plugin.prototype.openApplication = function(application){
  var self = this,
    fullCommand = '',
    command = self.options.receiverPath;
  if(isWindows){
    fullCommand = '"' + command + '"';
    if(application){
      fullCommand += ' -launch -name "' + application + '"'
    }
  }else{
    fullCommand = 'open ' + command;
  }
  debug('fullCommand to exec', fullCommand);
  exec(fullCommand);
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = _.extend({ receiverPath: DEFAULT_RECEIVER_PATH }, options);
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
