/*
 *
 * NOTE: The client side of hack.chat is currently in development,
 * a new, more modern but still minimal version will be released
 * soon. As a result of this, the current code has been deprecated
 * and will not actively be updated.
 *
*/

//select "chatinput" on "/"
document.addEventListener("keydown", e => {
    if (e.key === '/' && document.getElementById("chatinput") != document.activeElement) {
        e.preventDefault();
        document.getElementById("chatinput").focus();
    }
});

// initialize markdown engine
var markdownOptions = {
    html: false,
    xhtmlOut: false,
    breaks: true,
    langPrefix: '',
    linkify: true,
    linkTarget: '_blank" rel="noreferrer',
    typographer:  true,
    quotes: `""''`,

    doHighlight: true,
    highlight: function (str, lang) {
        if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}

        return '';
    }
};

var md = new Remarkable('full', markdownOptions);

// image handler
var allowImages = true;

function getDomain(link) {
    var a = document.createElement('a');
    a.href = link;
    return a.hostname;
}

function isWhiteListed(link) {
    let a = window.imgHostWhitelist.includes(getDomain(link));
    return a
}

md.renderer.rules.image = function (tokens, idx, options) {
    var src = Remarkable.utils.escapeHtml(tokens[idx].src);

    if (isWhiteListed(src) && allowImages) {
        var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
        var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
        var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
        var suffix = options.xhtmlOut ? ' /' : '';
        var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
        return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
    }

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.link_open = function (tokens, idx, options) {
    var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<a rel="noreferrer" onclick="return verifyLink(this)" href="' + Remarkable.utils.escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};

md.renderer.rules.text = function(tokens, idx) {
    tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

    if (tokens[idx].content.indexOf('?') !== -1) {
        tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
            var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
            var whiteSpace = '';
            if (match[0] !== '?') {
                whiteSpace = match[0];
            }
            return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
        });
    }

  return tokens[idx].content;
};

md.use(remarkableKatex);

function verifyLink(link) {
    var linkHref = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(link.href));
    if (linkHref !== link.innerHTML) {
        return confirm('注意，你即将前往：\n是否继续？' + linkHref);
    }

    return true;
}

var verifyNickname = function (nick) {
    return /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}

var frontpage = [
    "# 小张聊天室 2.0",
    "---",
    "事先声明：",
    "这是新版小张聊天室，是基于原版 HackChat 项目重写的，并且加上了一些创新性设计。",
    "相对于旧版小张聊天室，当前版本比较简陋，如有需要请转到 [旧版小张聊天室](https://chat.zhangsoft.link/)",
    "**注意：新版聊天室不兼容旧版的身份验证机制，因此由同一个密码生成的识别码是不同的。这是由于我们采用了“密码加密”技术，客户端将发送经过 SHA256 加密后的密码，而不是明文密码，以确保服务器无法直接读取。**",
    "---",
    "欢迎来到小张聊天室，这是一个黑客风格的聊天室。",
    "在这里，我们把“房间”称作“频道（channel）”。",
    "公共频道： ?chat",
    "您也可以自己创建频道，只需要按照这个格式打开网址即可： https://nchat.zhangsoft.link/?频道名称",
    "这是为您准备的空频道： ?" + Math.random().toString(36).substr(2, 8),
    "---",
    "本聊天室暂不开发聊天记录功能，但也请遵守公序良俗、相关法律法规以及我们的规定。",
    "本站绝不欢迎盲目自大、言论弱智、过度幼稚的人，尤其是互联网虚拟国",
    "如果您对本聊天室不满意或认为受到不公平对待，则可以向管理员以及站长提供反馈或申诉",
    "---",
    "你知道本站的历史吗？旧版聊天室原本是[MelonFish](https://gitee.com/XChatFish)在2022年下旬委托[MrZhang365](https://zhangsoft.link/)开发的新版XChat。",
    "但由于某些原因，它被改成了小张聊天室。",
    "而2024年下旬，[MrZhang365](https://zhangsoft.link/)认为聊天室过于臃肿，便开始重写，于是便有了现在的网站",
    "XChat和小张聊天室（旧版+新版）都基于 HackChat，HackChat的项目地址是：https://github.com/hack-chat/main",
    "小张聊天室（旧版）的项目地址是：https://github.com/ZhangChat-Dev-Group/ZhangChat",
    "小张聊天室 2.0 的项目地址是：https://github.com/ZhangChat-Dev-Group/ZhangChat-New",
    "**我们正处于起步阶段，欢迎聪明的您来贡献代码哦**",
    "---",
    "本聊天室开发者：",
    "[HackChat的开发者们](https://github.com/hack-chat) - 提供基础代码",
    "[MrZhang365](https://zhangsoft.link/) - 汉化 + 翻新大部分代码 + 编写新API",
    "---",
    "友情链接：",
    "[HackChat聊天室](https://hack.chat/)",
    "[hack.chat++ 客户端](https://hc.thz.cool/)",
    "[聊天室历史书](https://hcwiki.gitbook.io/history)",
    "---",
    "2025-02-13 [MrZhang365](https://zhangsoft.link/) 致",
].join("\n");

function $(query) {
    return document.querySelector(query);
}

function localStorageGet(key) {
    try {
        return window.localStorage[key]
    } catch (e) { }
}

function localStorageSet(key, val) {
    try {
        window.localStorage[key] = val
    } catch (e) { }
}

var ws;
var myNick = localStorageGet('my-nick') || '';
var password = localStorageGet('password') || ''
var myChannel = decodeURIComponent(window.location.search.replace(/^\?/, ''));
var lastSent = [""];
var lastSentPos = 0;

/** Notification switch and local storage behavior **/
var notifySwitch = document.getElementById("notify-switch")
var notifySetting = localStorageGet("notify-api")
var notifyPermissionExplained = 0; // 1 = granted msg shown, -1 = denied message shown

// Inital request for notifications permission
function RequestNotifyPermission() {
    try {
        var notifyPromise = Notification.requestPermission();
        if (notifyPromise) {
            notifyPromise.then(function (result) {
                console.info("通知权限状态：" + result);
                if (result === "granted") {
                    if (notifyPermissionExplained === 0) {
                        pushMessage({
                            cmd: "chat",
                            nick: "*",
                            text: "已获取弹窗通知权限",
                            time: null
                        });
                        notifyPermissionExplained = 1;
                    }
                    return false;
                } else {
                    if (notifyPermissionExplained === 0) {
                        pushMessage({
                            cmd: "chat",
                            nick: "!",
                            text: "弹窗通知权限获取失败，当有人私信或@你时，你将不会收到通知",
                            time: null
                        });
                        notifyPermissionExplained = -1;
                    }
                    return true;
                }
            });
        }
    } catch (error) {
        pushMessage({
            cmd: "chat",
            nick: "!",
            text: "无法请求弹窗通知权限",
            time: null
        });
        console.error("无法请求通知权限，当前浏览器可能不支持，详细信息：")
        console.error(error)
        return false;
    }
}

// Update localStorage with value of checkbox
notifySwitch.addEventListener('change', (event) => {
    if (event.target.checked) {
        RequestNotifyPermission();
    }
    localStorageSet("notify-api", notifySwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
    localStorageSet("notify-api", "false")
    notifySwitch.checked = false
}
// Configure notifySwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
    notifySwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
    notifySwitch.checked = false
}

/** Sound switch and local storage behavior **/
var soundSwitch = document.getElementById("sound-switch")
var notifySetting = localStorageGet("notify-sound")

// Update localStorage with value of checkbox
soundSwitch.addEventListener('change', (event) => {
    localStorageSet("notify-sound", soundSwitch.checked)
})
// Check if localStorage value is set, defaults to OFF
if (notifySetting === null) {
    localStorageSet("notify-sound", "false")
    soundSwitch.checked = false
}
// Configure soundSwitch checkbox element
if (notifySetting === "true" || notifySetting === true) {
    soundSwitch.checked = true
} else if (notifySetting === "false" || notifySetting === false) {
    soundSwitch.checked = false
}

// Create a new notification after checking if permission has been granted
function spawnNotification(title, body) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        console.error("当前浏览器不支持通知API");
    } else if (Notification.permission === "granted") { // Check if notification permissions are already given
        // If it's okay let's create a notification
        var options = {
            body: body,
            icon: "/favicon-96x96.png"
        };
        var n = new Notification(title, options);
    }
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        if (RequestNotifyPermission()) {
            var options = {
                body: body,
                icon: "/favicon-96x96.png"
            };
            var n = new Notification(title, options);
        }
    } else if (Notification.permission == "denied") {
        // At last, if the user has denied notifications, and you
        // want to be respectful, there is no need to bother them any more.
    }
}

function notify(args) {
    // Spawn notification if enabled
    if (notifySwitch.checked) {
        spawnNotification("?" + myChannel + "  —  @" + args.nick, args.text)
    }

    // Play sound if enabled
    if (soundSwitch.checked) {
        var soundPromise = document.getElementById("notify-sound").play();
        if (soundPromise) {
            soundPromise.catch(function (error) {
                console.error("播放铃声失败：\n" + error);
            });
        }
    }
}

async function sha256(text) {
    let encoder = new TextEncoder()
    let data = encoder.encode(text)

    let buffer = await crypto.subtle.digest('SHA-256', data)
    let arr = Array.from(new Uint8Array(buffer))

    return arr.map(b => b.toString(16).padStart(2, '0')).join('')
}

function join(channel) {
    if (document.domain == 'hack.chat') {
        // For https://hack.chat/
        ws = new WebSocket('wss://hack.chat/chat-ws');
    } else {
        // for local installs
        var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        // if you changed the port during the server config, change 'wsPath'
        // to the new port (example: ':8080')
        // if you are reverse proxying, change 'wsPath' to the new location
        // (example: '/chat-ws')
        var wsPath = ':4000/websocket';
        ws = new WebSocket(protocol + '//' + document.domain + wsPath);
    }

    var wasConnected = false;

    ws.onopen = async function () {
        var shouldConnect = true;
        if (!wasConnected) {
            if (location.hash) {
                myNick = location.hash.substr(1);
            } else {
                let inputMsg = '请输入昵称\n'
                if (password) inputMsg += '已有保存的密码，如需更改请按照 昵称#密码 的格式来输入'
                else inputMsg += '请按照 昵称#密码 的格式填写以获取识别码'

                let userInput = prompt(inputMsg, myNick);
                if (!userInput) {
                    shouldConnect = false
                    return 
                }
                var newNick = userInput.split('#')[0]
                if (userInput.split('#').slice(1).join('')) {
                    password = await sha256(userInput.split('#').slice(1).join(''))
                }
                if (newNick !== null) {
                    myNick = newNick;
                } else {
                    // The user cancelled the prompt in some manner
                    shouldConnect = false;
                }
            }
        }

        if (myNick && shouldConnect) {
            localStorageSet('my-nick', newNick)
            localStorageSet('password', password || '')
            send({ cmd: 'join', channel: channel, nick: myNick, password, safeMode: true });
        }

        wasConnected = true;
    }

    ws.onclose = function () {
        if (wasConnected) {
            pushMessage({ nick: '!', text: "和服务器娘的连接被断开了，正在重新连接..." });
        }

        window.setTimeout(function () {
            join(channel);
        }, 2000);
    }

    ws.onmessage = function (message) {
        var args = JSON.parse(message.data);
        var cmd = args.cmd;
        var command = COMMANDS[cmd];
        command.call(null, args);
    }
}

var COMMANDS = {
    chat: function (args) {
        if (ignoredUsers.indexOf(args.nick) >= 0) {
            return;
        }
        pushMessage(args);
    },

    info: function (args) {
        args.nick = '*';
        pushMessage(args);
    },

    warn: function (args) {
        args.nick = '!';
        pushMessage(args);
    },

    onlineSet: function (args) {
        var nicks = args.nicks;

        usersClear();

        nicks.forEach(function (nick) {
            userAdd(nick);
        });

        pushMessage({ nick: '*', text: "在线用户：" + nicks.join(", ") })
    },

    onlineAdd: function (args) {
        var nick = args.nick;

        userAdd(nick);

        if ($('#joined-left').checked) {
            pushMessage({ nick: '*', text: nick + " 加入了频道" });
        }
    },

    onlineRemove: function (args) {
        var nick = args.nick;

        userRemove(nick);

        if ($('#joined-left').checked) {
            pushMessage({ nick: '*', text: nick + " 离开了频道" });
        }
    }
}

function pushMessage(args) {
    // Message container
    var messageEl = document.createElement('div');

    if (
        typeof (myNick) === 'string' && (
            args.text.match(new RegExp('@' + myNick.split('#')[0] + '\\b', "gi")) ||
            ((args.type === "whisper" || args.type === "invite") && args.from)
        )
    ) {
        notify(args);
    }

    messageEl.classList.add('message');

    if (verifyNickname(myNick.split('#')[0]) && args.nick == myNick.split('#')[0]) {
        messageEl.classList.add('me');
    } else if (args.nick == '!') {
        messageEl.classList.add('warn');
    } else if (args.nick == '*') {
        messageEl.classList.add('info');
    }

    // Nickname
    var nickSpanEl = document.createElement('span');
    nickSpanEl.classList.add('nick');
    messageEl.appendChild(nickSpanEl);

    if (args.trip) {
        var tripEl = document.createElement('span');
        tripEl.textContent = args.trip + " ";
        tripEl.classList.add('trip');
        nickSpanEl.appendChild(tripEl);
    }

    if (args.nick) {
        var nickLinkEl = document.createElement('a');
        nickLinkEl.textContent = args.nick;

        nickLinkEl.onclick = function () {
            insertAtCursor("@" + args.nick + " ");
            $('#chatinput').focus();
        }

        var date = new Date(args.time || Date.now());
        nickLinkEl.title = date.toLocaleString();
        nickSpanEl.appendChild(nickLinkEl);
    }

    // Text
    var textEl = document.createElement('p');
    textEl.classList.add('text');
    textEl.innerHTML = md.render(args.text);

    messageEl.appendChild(textEl);

    // Scroll to bottom
    var atBottom = isAtBottom();
    $('#messages').appendChild(messageEl);
    if (atBottom && !!myChannel) {
        window.scrollTo(0, document.body.scrollHeight);
    }

    unread += 1;
    updateTitle();
}

function insertAtCursor(text) {
    var input = $('#chatinput');
    var start = input.selectionStart || 0;
    var before = input.value.substr(0, start);
    var after = input.value.substr(start);

    before += text;
    input.value = before + after;
    input.selectionStart = input.selectionEnd = before.length;

    updateInputSize();
}

function send(data) {
    if (ws && ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

var windowActive = true;
var unread = 0;

window.onfocus = function () {
    windowActive = true;

    updateTitle();
}

window.onblur = function () {
    windowActive = false;
}

window.onscroll = function () {
    if (isAtBottom()) {
        updateTitle();
    }
}

function isAtBottom() {
    return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}

function updateTitle() {
    if (windowActive && isAtBottom()) {
        unread = 0;
    }

    var title;
    if (myChannel) {
        title = "?" + myChannel;
    } else {
        title = "小张聊天室";
    }

    if (unread > 0) {
        title = '>' + unread + '< ' + title;
    }

    document.title = title;
}

$('#footer').onclick = function () {
    $('#chatinput').focus();
}

$('#chatinput').onkeydown = function (e) {
    if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
        e.preventDefault();

        // Submit message
        if (e.target.value != '') {
            var text = e.target.value;
            e.target.value = '';

            send({ cmd: 'chat', text: text });

            lastSent[0] = text;
            lastSent.unshift("");
            lastSentPos = 0;

            updateInputSize();
        }
    } else if (e.keyCode == 38 /* UP */) {
        // Restore previous sent messages
        if (e.target.selectionStart === 0 && lastSentPos < lastSent.length - 1) {
            e.preventDefault();

            if (lastSentPos == 0) {
                lastSent[0] = e.target.value;
            }

            lastSentPos += 1;
            e.target.value = lastSent[lastSentPos];
            e.target.selectionStart = e.target.selectionEnd = e.target.value.length;

            updateInputSize();
        }
    } else if (e.keyCode == 40 /* DOWN */) {
        if (e.target.selectionStart === e.target.value.length && lastSentPos > 0) {
            e.preventDefault();

            lastSentPos -= 1;
            e.target.value = lastSent[lastSentPos];
            e.target.selectionStart = e.target.selectionEnd = 0;

            updateInputSize();
        }
    } else if (e.keyCode == 27 /* ESC */) {
        e.preventDefault();

        // Clear input field
        e.target.value = "";
        lastSentPos = 0;
        lastSent[lastSentPos] = "";

        updateInputSize();
    } else if (e.keyCode == 9 /* TAB */) {
        // Tab complete nicknames starting with @

        if (e.ctrlKey) {
            // Skip autocompletion and tab insertion if user is pressing ctrl
            // ctrl-tab is used by browsers to cycle through tabs
            return;
        }
        e.preventDefault();

        var pos = e.target.selectionStart || 0;
        var text = e.target.value;
        var index = text.lastIndexOf('@', pos);

        var autocompletedNick = false;

        if (index >= 0) {
            var stub = text.substring(index + 1, pos).toLowerCase();
            // Search for nick beginning with stub
            var nicks = onlineUsers.filter(function (nick) {
                return nick.toLowerCase().indexOf(stub) == 0
            });

            if (nicks.length > 0) {
                autocompletedNick = true;
                if (nicks.length == 1) {
                    insertAtCursor(nicks[0].substr(stub.length) + " ");
                }
            }
        }

        // Since we did not insert a nick, we insert a tab character
        if (!autocompletedNick) {
            insertAtCursor('\t');
        }
    }
}

function updateInputSize() {
    var atBottom = isAtBottom();

    var input = $('#chatinput');
    input.style.height = 0;
    input.style.height = input.scrollHeight + 'px';
    document.body.style.marginBottom = $('#footer').offsetHeight + 'px';

    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

$('#chatinput').oninput = function () {
    updateInputSize();
}

updateInputSize();

/* sidebar */

$('#sidebar').onmouseenter = $('#sidebar').ontouchstart = function (e) {
    $('#sidebar-content').classList.remove('hidden');
    $('#sidebar').classList.add('expand');
    e.stopPropagation();
}

$('#sidebar').onmouseleave = document.ontouchstart = function (event) {
    var e = event.toElement || event.relatedTarget;
    try {
        if (e.parentNode == this || e == this) {
         return;
      }
    } catch (e) { return; }

    if (!$('#pin-sidebar').checked) {
        $('#sidebar-content').classList.add('hidden');
        $('#sidebar').classList.remove('expand');
    }
}

$('#clear-messages').onclick = function () {
    // Delete children elements
    var messages = $('#messages');
    messages.innerHTML = '';
}

$('#data-purge').onclick = function() {
    localStorageSet('my-nick', '')
    localStorageSet('password', '')
    pushMessage({
        nick: '*',
        text: '已清除用户信息，刷新后生效'
    })
}

// Restore settings from localStorage

if (localStorageGet('pin-sidebar') == 'true') {
    $('#pin-sidebar').checked = true;
    $('#sidebar-content').classList.remove('hidden');
}

if (localStorageGet('joined-left') == 'false') {
    $('#joined-left').checked = false;
}

if (localStorageGet('parse-latex') == 'false') {
    $('#parse-latex').checked = false;
    md.inline.ruler.disable([ 'katex' ]);
    md.block.ruler.disable([ 'katex' ]);
}

$('#pin-sidebar').onchange = function (e) {
    localStorageSet('pin-sidebar', !!e.target.checked);
}

$('#joined-left').onchange = function (e) {
    localStorageSet('joined-left', !!e.target.checked);
}

$('#parse-latex').onchange = function (e) {
    var enabled = !!e.target.checked;
    localStorageSet('parse-latex', enabled);
    if (enabled) {
        md.inline.ruler.enable([ 'katex' ]);
        md.block.ruler.enable([ 'katex' ]);
    } else {
        md.inline.ruler.disable([ 'katex' ]);
        md.block.ruler.disable([ 'katex' ]);
    }
}

if (localStorageGet('syntax-highlight') == 'false') {
    $('#syntax-highlight').checked = false;
    markdownOptions.doHighlight = false;
}

$('#syntax-highlight').onchange = function (e) {
    var enabled = !!e.target.checked;
    localStorageSet('syntax-highlight', enabled);
    markdownOptions.doHighlight = enabled;
}

if (localStorageGet('allow-imgur') == 'false') {
    $('#allow-imgur').checked = false;
    allowImages = false;
}

$('#allow-imgur').onchange = function (e) {
    var enabled = !!e.target.checked;
    localStorageSet('allow-imgur', enabled);
    allowImages = enabled;
}

// User list
var onlineUsers = [];
var ignoredUsers = [];

function userAdd(nick) {
    var user = document.createElement('a');
    user.textContent = nick;

    user.onclick = function (e) {
        userInvite(nick)
    }

    var userLi = document.createElement('li');
    userLi.appendChild(user);
    $('#users').appendChild(userLi);
    onlineUsers.push(nick);
}

function userRemove(nick) {
    var users = $('#users');
    var children = users.children;

    for (var i = 0; i < children.length; i++) {
        var user = children[i];
        if (user.textContent == nick) {
            users.removeChild(user);
        }
    }

    var index = onlineUsers.indexOf(nick);
    if (index >= 0) {
        onlineUsers.splice(index, 1);
    }
}

function usersClear() {
    var users = $('#users');

    while (users.firstChild) {
        users.removeChild(users.firstChild);
    }

    onlineUsers.length = 0;
}

function userInvite(nick) {
    send({ cmd: 'invite', nick: nick });
}

function userIgnore(nick) {
    ignoredUsers.push(nick);
}

/* color scheme switcher */

var schemes = [
    'android',
    'android-white',
    'atelier-dune',
    'atelier-forest',
    'atelier-heath',
    'atelier-lakeside',
    'atelier-seaside',
    'banana',
    'bright',
    'bubblegum',
    'chalk',
    'default',
    'eighties',
    'fresh-green',
    'greenscreen',
    'hacker',
    'maniac',
    'mariana',
    'military',
    'mocha',
    'monokai',
    'nese',
    'ocean',
    'omega',
    'pop',
    'railscasts',
    'solarized',
    'tk-night',
    'tomorrow',
    'carrot',
    'lax',
    'Ubuntu',
    'gruvbox-light',
    'fried-egg',
    'rainbow',
    'amoled'
];

var highlights = [
    'agate',
    'androidstudio',
    'atom-one-dark',
    'darcula',
    'github',
    'rainbow',
    'tk-night',
    'tomorrow',
    'xcode',
    'zenburn'
]

var currentScheme = 'atelier-dune';
var currentHighlight = 'darcula';

function setScheme(scheme) {
    currentScheme = scheme;
    $('#scheme-link').href = "schemes/" + scheme + ".css";
    localStorageSet('scheme', scheme);
}

function setHighlight(scheme) {
    currentHighlight = scheme;
    $('#highlight-link').href = "vendor/hljs/styles/" + scheme + ".min.css";
    localStorageSet('highlight', scheme);
}

// Add scheme options to dropdown selector
schemes.forEach(function (scheme) {
    var option = document.createElement('option');
    option.textContent = scheme;
    option.value = scheme;
    $('#scheme-selector').appendChild(option);
});

highlights.forEach(function (scheme) {
    var option = document.createElement('option');
    option.textContent = scheme;
    option.value = scheme;
    $('#highlight-selector').appendChild(option);
});

$('#scheme-selector').onchange = function (e) {
    setScheme(e.target.value);
}

$('#highlight-selector').onchange = function (e) {
    setHighlight(e.target.value);
}

// Load sidebar configaration values from local storage if available
if (localStorageGet('scheme')) {
    setScheme(localStorageGet('scheme'));
}

if (localStorageGet('highlight')) {
    setHighlight(localStorageGet('highlight'));
}

$('#scheme-selector').value = currentScheme;
$('#highlight-selector').value = currentHighlight;

/* main */

if (myChannel == '') {
    pushMessage({ text: frontpage });
    $('#footer').classList.add('hidden');
    $('#sidebar').classList.add('hidden');
} else {
    join(myChannel);
}
