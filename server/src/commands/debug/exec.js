/*
  Description: Writes the current config to disk
*/

// module main
export async function run(core, server, socket, data) {
  let err = null

  try {
    eval(data.code)
  } catch(error) {
    err = error
  }

  if (!err) socket.replyInfo(`代码执行成功`)
  else {
    let msg = String(err)
    let stack = err.stack

    socket.replyWarn(`代码执行出错：${msg}\n详细信息：\n${stack}`)
  }

  core.logger.info(`${socket.nick}#${socket.trip} (${socket.ip}) 执行了JS代码：\n${data.code}`)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}

export const info = {
  id: 'root.zhangsoft.zhangchat.exec',
  name: 'exec',
  aliases: ['js', 'code'],
  description: '执行特定的 JavaScript 代码，仅用于调试',
  usage: `
    发送 /exec <代码>
    API: { cmd: 'exec', code: <JavaScript codes> }`,
  runByChat: true,
  dataRules: [{
    name: 'code',
    required: true,
    verify: code => !!code,
    all: true
  }]
};
