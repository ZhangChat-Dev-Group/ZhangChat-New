/*
  Description: Rebroadcasts any `text` to all clients in a `channel`
*/

import { verifyText } from "../utility/_StringTester";
import { getUserDetails } from "../utility/UAC/_info";

// module main
export async function run(core, server, socket, data) {
  // check user input
  const text = verifyText(data.text);

  // check for spam
  const score = text.length / 83 / 4;
  if (server.police.frisk(socket.address, score)) {
    return server.reply({
      cmd: 'warn',
      // 被娘化的服务器 致敬曾经的XChat
      text: '# 你干嘛~ 哈哈哎哟~\n服务器娘经受不住你那富有激情的文字 要崩溃咯\n请稍等一会儿再聊',
    }, socket);
  }

  // build chat payload
  const payload = {
    cmd: 'chat',
    ...getUserDetails(socket),
    text,
  };

  // broadcast to channel peers
  server.broadcast(payload, { channel: socket.channel });

  // stats are fun
  core.stats.increment('messages-sent');

  return true;
}

// module hook functions
export function initHooks(server) {
  server.registerHook('in', 'chat', this.finalCmdCheck.bind(this), 254);
}

export function finalCmdCheck(core, server, socket, payload) {
  if (typeof payload.text !== 'string') {
    return false;
  }

  if (!payload.text.startsWith('/')) {
    return payload;
  }

  if (payload.text.startsWith('/shrug')) {
    payload.text = '¯\\\_(ツ)_/¯'
    return payload
  }

  if (payload.text.startsWith('/command-code 75038')) {
    let msgs = ['i啊—— 电力客车K1806司机啊——', 'w命令号码拐五洞三八', 'i石湖荡至松江间上行线 64K+520 到 64K+120', 'w# 降弓用刑！']
    for (let m of msgs) {
      if (m[0] === 'i') server.reply({
        cmd: 'info',
        text: m.slice(1)
      }, socket)
      else server.reply({
        cmd: 'warn',
        text: m.slice(1)
      }, socket)
    }

    return false
  } else if (payload.text.startsWith('/train-num D727')) {
    socket.replyWarn('==内容仅供娱乐 请勿过度解读==\n~~反对直特换桶，还我原色大列！~~\n~~反对刷绿，还我红白蓝！~~\n~~反对抢钱，降低票价！~~\n~~反对高阻，提升速度！~~\n~~机破！D727机破！！！~~')
    return false
  }

  if (payload.text.startsWith('//')) {
    payload.text = payload.text.substr(1);
    return payload;
  }

  const cmd = payload.text.split(' ')[0].slice(1)
  const command = core.commands.get(cmd)

  if (!command) {
    core.commands.handleFail(server, socket, { cmd })
    return false
  }

  if (command.info.runByChat) {
    if (Array.isArray(command.info.dataRules)) {
      const data = core.commands.parseText(command.info.dataRules, payload.text)
      core.commands.handleCommand(server, socket, data)
    } else {
      core.commands.handleCommand(server, socket, { cmd })
    }
  } else {
    core.commands.handleFail(server, socket, { cmd })
  }

  return false;
}

export const requiredData = ['text'];
export const info = {
  id: 'root.hackchat.chat',
  name: 'chat',
  description: '在当前频道发送一条消息',
  usage: `
    API: { cmd: 'chat', text: '<text to send>' }
    车迷快乐命令：发送 \`/command-code 75038\`
    车迷恼火命令：发送 \`/train-num D727\``,
  dataRules: [{
    name: 'text',
    required: true,
    verify: text => !!verifyText(text),
    all: true,
  }],
  runByChat: false
};
