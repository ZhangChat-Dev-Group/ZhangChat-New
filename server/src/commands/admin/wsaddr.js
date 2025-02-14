/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

export function init(core) {
  if (typeof core.config.wsAddr !== 'string') {
    core.config.wsAddr = ''
    core.configManager.save()
  }
}

export function wsAddr(core, req) {
  return `window.wsAddr = '${core.config.wsAddr}'`
}

export function initFjs(httpServer) {
  httpServer.registerFjs('ws-addr', this.wsAddr)
}

// module main
export async function run(core, server, socket, data) {
  if (!data.text) return socket.replyInfo(`当前 WebSocket 连接地址为：${core.config.wsAddr}`)

  core.config.wsAddr = data.text
  socket.reply(`已将 WebSocket 连接地址修改为：${data.text}`)
  if (!core.configManager.save()) socket.replyWarn(`配置文件保存失败，请检查日志`)
  core.logger.info(`已将 WebSocket 连接地址修改为：${data.text}`)
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.admin']
}

export const info = {
  id: 'root.zhangsoft.zhangchat.wsctl',
  name: 'wsctl',
  description: '设置WebSocket连接地址',
  usage: `
    发送 /wsctl <地址>
    API: { cmd: 'wsctl', text: '<address>' }`,
  runByChat: true,
  dataRules: [
    {
      name: 'text',
      required: false,
      verify: /^(ws|wss):\/\/[a-zA-Z0-9.-]+(:[0-9]+)?(\/[\w/.-]*)?(\?[^\s]*)?$/
    }
  ]
};
