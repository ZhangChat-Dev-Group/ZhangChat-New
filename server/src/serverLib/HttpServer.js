import { Server } from 'http'
import express from 'express'
import { resolve } from 'path'
import { parse as parseUrl } from 'url'

class HttpServer extends Server {
    constructor(core, mainServer) {
        super()
        this.core = core
        this.mainServer = mainServer

        this.fjs = new Map()
        this.on('request', this.handleRequest)
        this.on('error', this.handleError)
        this.on('upgrade', this.handleUpgrade)
        this.exp = express()
        this.exp.use('/',
            express.static(resolve(__dirname, '../../../client'))
        )
        this.exp.get('/fjs/:target', this.fakeJavaScript.bind(this))
    }

    getIp(req) {
        let useXff = false
        let ipHeader = this.core.config.ipHeader

        if (!!ipHeader && req.headers[ipHeader].trim()) useXff = true

        let ip = ''
        if (useXff) {
            let ips = req.headers[ipHeader].trim().split(',')
            ip = ips[0]
        } else ip = req.socket.remoteAddress
        
        if (ip.startsWith('::ffff:')) ip = ip.slice(7)
        return ip
    }

    handleRequest(req, res) {
        this.core.stats.increment('http-requests')
        let ip = this.getIp(req)
        
        if (this.core.config.bannedIPs.includes(ip)) {
            res.writeHead(403, 'Banned', {
                'X-ZHC-Reason': 'Banned',
                'Content-Type': 'text/plain; charset=utf-8',
            })
            res.write('You have been banned. Contacting our administrators and reporting your IP address may be helpful. Your IP address is: ' + ip + '\n')
            res.write('您已经被封禁。联系我们的管理员并报告你的IP地址可能有帮助。你的IP地址是：' + ip)
            res.end()
            return this.core.logger.info('已阻止被封禁的IP：' + ip)
        }

        let urlInfo = parseUrl(req.url)
        let filename = urlInfo.pathname

        if (filename === 'websocket') {
            res.writeHead(400, 'Bad Request', {
                'X-ZHC-Reason': 'WebSocket',
                'Content-Type': 'text/plain; charset=utf-8',
            })
            res.write('Please do not directly access the WebSocket server through a browser.\n')
            res.write('请不要通过浏览器访问WebSocket服务。\n')
            res.end()
            return this.core.logger.warn(`错误地访问WebSocket服务器 IP：${ip}`)
        }

	    this.exp(req, res)
    }

    handleUpgrade(req, socket, head) {
        let ip = this.getIp(req)
        if (this.core.config.bannedIPs.includes(ip)) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
            socket.destroy()
            this.core.logger.info(`已拒绝 ${ip} 连接 WebSocket 原因：已被封禁`)
        } else if (parseUrl(req.url).pathname !== '/websocket') {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
            socket.destroy()
            this.core.logger.warn(`已拒绝 ${ip} 连接 WebSocket 原因：错误的路径`)
        } else if (this.mainServer.police.frisk(ip, 0)) {
            socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n')
            socket.destroy()
            this.core.logger.warn(`已拒绝 ${ip} 连接 WebSocket 原因：操作过于频繁`)
        } else {
            this.mainServer.handleUpgrade(req, socket, head, sock => {
                this.mainServer.emit('connection', sock, req)
            })
        }
    }

    handleError(err) {
        this.core.logger.error('HTTP服务器错误' + err)
    }

    clearFjs() {
	    this.fjs.clear()
    }

    registerFjs(name, generator) {
        if (typeof name !== 'string' || !name) throw new TypeError('参数 name 类型错误')
        if (typeof generator !== 'function') throw new TypeError('参数 writer 类型错误')
        this.fjs.set(name + '.fake.js', generator)
    }

    fakeJavaScript(req, res) {
        const target = req.params.target
        if (!target) return res.status(400).end()

        if (!this.fjs.has(target)) return res.send(`alert("Server Error: No such fjs generater.\\nIf you are our developer, please check index.html.\\nIf you are just a user, please report this situation to our developers.\\nEmail: ${this.core.config.email}\\n服务器错误：没有找到fjs生成器。\\n如果你是我们的开发者，请检查服务器日志。\\n如果你仅仅是一位用户，请将此情况报告给我们的开发者。\\n电子邮箱：${this.core.config.email}")`)
        let generator = this.fjs.get(target)
        res.type('.js')

        try {
            var ret = generator(this.core, req)
            if (typeof ret !== 'string') throw new TypeError('fjs 脚本返回值类型错误 必须是字符串')
        } catch(err) {
            res.send(`alert("Server Error: Failed to generate fjs.\\nIf you are our developer, please check server logs.\\nIf you are just a user, please report this situation to our developers.\\nEmail: ${this.core.config.email}\\n服务器错误：无法生成fjs。\\n如果你是我们的开发者，请检查服务器日志。\\n如果你仅仅是一位用户，请将此情况报告给我们的开发者。\\n电子邮箱：${this.core.config.email}")`)
            return this.core.logger.error('fjs生成器执行出错：' + err)
        }
        res.send(ret)
    }
}

export default HttpServer
