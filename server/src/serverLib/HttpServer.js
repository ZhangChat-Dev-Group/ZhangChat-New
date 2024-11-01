import { Server } from 'http'
import { resolve } from 'path'
import { parse as parseUrl } from 'url'
import { readFile, existsSync, statSync } from 'fs'

class HttpServer extends Server {
    constructor(core, mainServer) {
        super()
        this.core = core
        this.mainServer = mainServer
        this.on('request', this.handleRequest)
        this.on('error', this.handleError)
        this.on('upgrade', this.handleUpgrade)
    }

    getIp(req) {
        let useXff = false
        if (this.core.config.useProxy && req.headers['x-forwarded-for'].trim()) useXff = true

        let ip = ''
        if (useXff) {
            let ips = req.headers['x-forwarded-for'].trim().split(',')
            ip = ips[0]
        } else ip = req.socket.remoteAddress
        
        if (ip.startsWith('::ffff:')) ip = ip.slice(7)
        return ip
    }

    handleRequest(req, res) {
        let ip = this.getIp(req)
        let banned = false
        
        if (this.core.config.bannedIPs.includes(ip)) {
            banned = true
            res.writeHead(403, 'Forbidden', {
                'X-ZHC-Reason': 'Banned',
                'Content-Type': 'text/plain; charset=utf-8',
            })
            res.autoEditCode = 403    // 告诉后面的代码 要把这个按照403的要求修改
            this.core.logger.info(`已重定向来自 ${ip} 的请求到 banned.html`)
        }

        if (req.method !== 'GET') {
            res.writeHead(405, 'Method Not Allowed', {
                'X-ZHC-Reason': 'GET only',
                'Content-Type': 'text/plain; charset=utf-8',
            })
            res.write('We only support GET method.\n')
            res.write('我们仅支持GET方法\n')
            res.end()
            return this.core.logger.warn(`已拒绝来自 ${ip} 的请求 原因：非GET请求`)
        }

        let urlInfo = parseUrl(req.url)
        let filename = urlInfo.pathname
	if (filename.startsWith('/')) filename = filename.slice(1)
        if (banned) filename = 'banned.html'    // 重定向

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

        let targetFile = resolve(__dirname, '../../../client', filename)
        if (!targetFile.startsWith(resolve(__dirname, '../../../client'))) {
            res.writeHead(400, 'Bad Request', {
                'X-ZHC-Reason': 'Bad Path',
                'Content-Type': 'text/plain; charset=utf-8',
            })
            res.write('Illegal path.\n')
            res.write('非法路径。\n')
            res.end()
            return this.core.logger.warn(`已拒绝来自 ${ip} 的请求 原因：非法路径`)
        }

        if (!existsSync(targetFile) || statSync(targetFile).isDirectory()) {
            if (existsSync(resolve(targetFile, 'index.html'))) targetFile = resolve(targetFile, 'index.html')
            else {
                res.writeHead(404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' })
                res.write('404 Not Found\n找不到文件\n')
                return res.end()
            }
        }

        readFile(targetFile, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                res.writeHead(500, 'Internal Server Error', {
                    'X-ZHC-Reason': 'Failed to read the file',
                    'Content-Type': 'text/plain; charset=utf-8',
                })
                res.write('Sorry, but we failed to read the file.\n非常抱歉，我们读取文件失败\n')
                res.end()
                this.core.logger.error('读取文件失败：' + err)
            } else {
                if (!res.headersSent) res.writeHead(200, 'OK')
                if (res.autoEditCode === 403) data = data.replaceAll('%ip', ip)
                res.write(data)
                res.end()
            }
        })
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
        this.core.logger.error('HTTP Server Error: ' + err)
    }
}

export default HttpServer
