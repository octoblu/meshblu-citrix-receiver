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
  var command = message.payload.command;
  var self = this;

  debug('command', command);
  switch(command){
    case 'start-receiver':
      self.openApplication(); 
      break;
    default:
      exec(self.options.receiverPath);
      break;
  }
};

Plugin.prototype.openApplication = function(){
  var self = this;
  var command = self.options.receiverPath
  debug('command to exec', command);
  if(isWindows){
    exec('"' + command + '"');
  }else{
    exec('open ' + command);
  }
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = _.defaults({ receiverPath: DEFAULT_RECEIVER_PATH }, options);
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
