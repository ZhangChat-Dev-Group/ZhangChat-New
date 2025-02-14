/*
 * Description: Make a user (spammer) dumb (mute)
 * Author: simple
 */

import { verifyNick } from "../utility/_StringTester";
import * as moment from 'moment'

// module constructor
export function init(core) {
  if (typeof core.mutedIPs === 'undefined') {
    core.mutedIPs = new Map();
  }
}

export function isMuted(core, ip) {
  if (!core.mutedIPs.has(ip)) return false
  let t = core.mutedIPs.get(ip)
  if (Date.now() > t) {
    core.mutedIPs.delete(ip)
    return false
  } else return t
}

export function diff(endTime) {
  let now = moment()
  let end = moment(endTime)

  return `${end.diff(now, 'days')} 天 ${end.diff(now, 'hours')} 时 ${end.diff(now, 'minutes')} 分 ${end.diff(now, 'seconds')} 秒`
}

// module main
export async function run(core, server, socket, data) {
  let target = server.findSocket({
    channel: socket.channel,
    nick: data.nick
  })
  if (!target) return socket.replyWarn(`找不到 ${data.nick}`)
  if (this.isMuted(core, target.ip)) return socket.replyWarn(`${target.nick} 已经被禁言了`) 
  if (core.permissions.inPermissionGroup(target.trip, 'root.zhangsoft.zhangchat.group.mod')) return server.reply({
    cmd: 'warn',
    text: `您不能禁言 ${data.nick}，因为对方属于管理员权限组`
  }, socket)

  let time = Date.now() + (data.time * 60 * 1000)
  core.mutedIPs.set(target.ip,  time)
  
  server.broadcast({
    cmd: 'info',
    text: `${target.nick} 被禁言 ${diff(time)}`
  }, { channel: socket.channel })
  server.broadcast({
    cmd: 'info',
    text: `${socket.nick}#${socket.trip} 在 ?${socket.channel} 禁言了 ${target.nick} ${diff(time)}\n目标IP：${target.ip}`
  }, { _group: 'root.zhangsoft.zhangchat.group.member' })
  server.broadcast({
    cmd: 'info',
    text: `你已被禁言，禁言将在 ${diff(time)}后自动解除\n禁言期间内请勿进进出出，以免受到更严厉的处罚\n如有异议，请向管理员发出申诉并提供IP地址：${target.ip}`
  }, { address: target.ip })

  core.logger.info(`(${socket.ip}) ${socket.nick}#${socket.trip} 禁言了IP地址：${target.ip} - ${data.time} min`)
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.check.bind(this), 255);
  server.registerHook('in', 'whisper', this.check.bind(this), 255);
  server.registerHook('in', 'reply', this.check.bind(this), 255);
  server.registerHook('in', 'emote', this.check.bind(this), 255);
}

// hook incoming chat commands, shadow-prevent chat if they are muzzled
export function check(core, server, socket, payload) {
  let t = this.isMuted(core, socket.ip)
  if (!t) return payload
  socket.replyWarn(`你已被禁言，禁言将在 ${this.diff(core, t)} 自动解除\n禁言期间内请勿进进出出，以免受到更严厉的处罚\n如有异议，请向管理员发出申诉并提供IP地址：${socket.ip}`)
  return false
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}

export const info = {
  id: 'root.hackchat.dumb',
  name: 'mute',
  aliases: ['dumb'],
  description: '禁言指定用户 最长时间为2天',
  usage: `
    API: { cmd: 'dumb', nick: '<target nick>', time: <分钟数> }
    发送 /mute <目标用户> <分钟数>`,
  runByChat: true,
  dataRules: [
    {
      name: 'nick',
      verify: verifyNick,
      required: true,
    },
    {
      name: 'time',
      required: true,
      verify: time => typeof time === 'number' && !isNaN(time) && time > 0 && time <= 2 * 24 * 60,    // 最长禁言2天
    }
  ]
};