'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-citrix-receiver');
var _ = require('lodash');
var exec = require('child_process').exec;

var isWindows = process.platform === 'win32'
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
      default: 'start-receiver'
    },
    application: {
      type: 'string',
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

  debug('command', command);
  switch(command){
    case 'start-receiver':
      self.openApplication(payload.application);
      break;
    case 'close-receiver':
      self.closeReceiver();
      break;
    default:
      debug('Invalid command.');
      break;
  }
};

Plugin.prototype.closeReceiver = function(){
  var self, command;
  self = this;

  if(!isWindows) {
    self.emit('message', {devices: '*', topic: 'error', payload: {error: 'close-receiver is only available for Windows'}});
    return;
  }

  command = '"' + self.options.receiverPath + "'";
  command += ' -logoff';
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
