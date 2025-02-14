/*
  Description: Forces a change on the target(s) socket's channel, then broadcasts event
*/

export function init(core) {
  if (!Array.isArray(core.config.imgbeds)) {
    core.config.imgbeds = []
    core.configManager.save()
  }
}

export function fjs(core, req) {
  let js = `window.imgHostWhitelist = `
  let whiteList = JSON.stringify(core.config.imgbeds)

  return js + whiteList
}

export function initFjs(httpServer) {
  httpServer.registerFjs('imgbeds', this.fjs)
}

// module main
export async function run(core, server, socket, data) {
  switch (data.action) {
    case 'ls': {
      socket.replyInfo('图床域名白名单列表：\n' + core.config.imgbeds.map(d => `\`${d}\``).join('\n'))
      break
    }

    case 'add': {
      if (!data.domain) return socket.replyWarn('请提供域名')
      if (core.config.imgbeds.includes(data.domain)) return socket.replyInfo(`该域名已经处于白名单内`)
      core.config.imgbeds.push(data.domain)
      server.broadcast({
        cmd: 'info',
        text: `${socket.nick}#${socket.trip} 添加了图床白名单域名：${data.domain}`
      }, { _group: 'root.zhangsoft.zhangchat.group.member' })

      if (!core.configManager.save()) socket.replyWarn(`配置文件保存失败，请联系站长处理`)
      break
    }

    case 'rm': {
      if (!data.domain) return socket.replyWarn('请提供域名')
      if (!core.config.imgbeds.includes(data.domain)) return socket.replyInfo('该域名不在白名单内')
      core.config.imgbeds = core.config.imgbeds.filter(d => d !== data.domain)
      server.broadcast({
        cmd: 'info',
        text: `${socket.nick}#${socket.trip} 删除了图床白名单域名：${data.domain}`
      }, { _group: 'root.zhangsoft.zhangchat.group.member' })

      if (!core.configManager.save()) socket.replyWarn(`配置文件保存失败，请联系站长处理`)
      break
    }

    default: { }
  }
}

export const approve = {
  groups: ['root.zhangsoft.zhangchat.group.mod']
}

export const info = {
  id: 'root.zhangsoft.zhangchat.imgctl',
  name: 'imgctl',
  description: '管理图床域名白名单',
  usage: `
    发送 /imgctl <操作（ls / add / rm）> <域名（可选）>
    API: { cmd: 'imgctl', action: '<ls / add / rm>', domain: '<domain>' }
    ls：列出白名单内域名
    add：添加域名
    rm：删除域名`,
  runByChat: true,
  dataRules: [
    {
      name: 'action',
      required: true,
      verify: a => ['ls', 'add', 'rm'].includes(a),
    },
    {
      name: 'domain',
      verify: /^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
    }
  ]
};
