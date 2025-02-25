/*
  Description: Initial entry point, applies `channel` and `nick` to the calling socket
*/

import { verifyNick, verifyChannel } from '../utility/_StringTester';
import { getUserDetails } from '../utility/UAC/_info';

// module support functions
const crypto = require('crypto');

const hash = (password) => {
  const sha = crypto.createHash('sha256');
  sha.update(password);
  return sha.digest('base64').substr(0, 6);
};

// exposed "login" function to allow hooks to verify user join events
// returns object containing user info or string if error
export function parseNickname(core, data) {
  const userInfo = {
    nick: '',
    trip: null,
  };

  // seperate nick from password
  userInfo.nick = data.nick

  if (!verifyNick(userInfo.nick)) {
    // return error as string
    return '昵称应当由汉字、大小写字母、数字和下划线组成，且最多24个字符';
  }

  let password = undefined;
  // prioritize hash in nick for password over password field
  if (!data.safeMode && data.password) {
    // 客户端是否启用了安全模式
    // 安全模式：客户端将经过SHA256加密后的密码发给服务器，服务器无法读取明文密码
    // 如果没有启用 那么就替客户端加密
    let sha256 = crypto.createHash('sha256')
    sha256.update(data.password)
    password = sha256.digest('hex')
    userInfo.safeWarning = true
  } else password = data.password

  if (password) {
    userInfo.trip = hash(password + core.config.tripSalt);
  } else {
    userInfo.trip = ''
  }

  return userInfo;
}

export async function run(core, server, socket, data) {
  const userInfo = this.parseNickname(core, data)
  if (typeof userInfo === 'string') return server.reply({
    cmd: 'warn',
    text: userInfo
  }, socket)

  if (userInfo.safeWarning) return socket.replyWarn(`# 安全提醒：\n为保证用户数据安全，本站已启用安全模式，即客户端向服务器发送SHA256加密后的密码而不是明文密码\n我们检测到您的客户端不支持安全模式，因此帮您额外加密了密码\n请您向该客户端的开发者报告此问题，感谢您的理解与支持`,
    socket)
  
  if (socket.channel) return socket.replyWarn('你已经加入了一个频道，不得重复加入')

  if (server.findSocket({
    channel: data.channel,
    nick: userInfo.nick,
  })) {
    return server.reply({
      cmd: 'warn',
      text: `已经有一位用户使用了 \`${userInfo.nick}\` 这个昵称，根据先到先得原则，您需要更换一个新昵称`
    }, socket)
  }

  userInfo.hash = server.getSocketHash(socket.address)
  userInfo.channel = data.channel

  let joinNotice = {
    cmd: 'onlineAdd',
    ...getUserDetails(socket),
    nick: userInfo.nick,
    trip: userInfo.trip,
    channel: userInfo.channel
  }

  let userList = {
    cmd: 'onlineSet',
    users: [],
    nicks: [],
  }

  for (let s of server.findSockets({
    channel: data.channel
  })) {
    server.reply(joinNotice, s)
    userList.users.push({
      ...getUserDetails(s),
      isme: false,
    })
    userList.nicks.push(s.nick)
  }

  for (let i in userInfo) socket[i] = userInfo[i]
  userList.users.push({
    ...getUserDetails(socket),
    isme: true,
  })
  userList.nicks.push(socket.nick)

  server.reply(userList, socket)
  core.stats.increment('users-joined')
}
 
// module main
export async function run_old(core, server, socket, data) {
  const userInfo = this.parseNickname(core, data);
  if (typeof userInfo === 'string') {
    return server.reply({
      cmd: 'warn',
      text: userInfo,
    }, socket);
  }

  // check if the nickname already exists in the channel
  const userExists = server.findSockets({
    channel: data.channel,
    nick: (targetNick) => targetNick.toLowerCase() === userInfo.nick.toLowerCase(),
  });

  if (userExists.length > 0) {
    // that nickname is already in that channel
    return server.reply({
      cmd: 'warn',
      text: '昵称被占用',
    }, socket);
  }

  userInfo.hash = server.getSocketHash(socket);

  // TODO: place this within it's own function allowing import
  // prepare to notify channel peers
  const newPeerList = server.findSockets({ channel: data.channel });
  const nicks = []; /* @legacy */
  const users = [];

  const joinAnnouncement = {
    cmd: 'onlineAdd',
    nick: userInfo.nick,
    trip: userInfo.trip || '',
    hash: userInfo.hash,
    userid: userInfo.userid,
    channel: data.channel,
  };

  // send join announcement and prep online set
  for (let i = 0, l = newPeerList.length; i < l; i += 1) {
    server.reply(joinAnnouncement, newPeerList[i]);
    nicks.push(newPeerList[i].nick); /* @legacy */

    users.push({
      nick: newPeerList[i].nick,
      trip: newPeerList[i].trip,
      hash: newPeerList[i].hash,
      userid: newPeerList[i].userid,
      channel: data.channel,
      isme: false,
    });
  }

  // store user info
  socket.nick = userInfo.nick;
  socket.trip = userInfo.trip;
  socket.channel = data.channel; /* @legacy */
  socket.hash = userInfo.hash;
  socket.userid = userInfo.userid;

  nicks.push(socket.nick); /* @legacy */
  users.push({
    nick: socket.nick,
    trip: socket.trip,
    hash: socket.hash,
    userid: socket.userid,
    channel: data.channel,
    isme: true,
  });

  // reply with channel peer list
  server.reply({
    cmd: 'onlineSet',
    nicks, /* @legacy */
    users,
  }, socket);

  // stats are fun
  core.stats.increment('users-joined');

  return true;
}

export const info = {
  id: 'root.hackchat.join',
  name: 'join',
  description: '加入一个频道',
  usage: `
    API: { cmd: 'join', nick: '<your nickname>', password: '<optional password>', channel: '<target channel>' }`,
  rateLimit: 3,
  dataRules: [
    {
      name: 'nick',
      required: true,
      verify: verifyNick
    },
    {
      name: 'channel',
      required: true,
      verify: verifyChannel
    },
    {
      name: 'password',
      required: false,
      all: true
    }
  ]
};
