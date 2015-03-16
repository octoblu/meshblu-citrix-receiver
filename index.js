'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-citrix-receiver')

DEFAULT_RECEIVER_PATH = 'C:\\Program Files (x86)\\Citrix\\SelfServicePlugin\\SelfService.exe'

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
  var command = message.command;
  var self = this;

  switch(command){
    case 'start-receiver':
      exec(self.options.receiverPath);
      break;
    default:
      exec(self.options.receiverPath);
      break;
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
