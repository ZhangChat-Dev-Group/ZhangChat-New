const colors = require('colors')
const moment = require('moment')

class Logger {
	log(text) {
		console.log(text)
	}
	info(text) {
		const prefix = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [INFO] `.green
		this.log(prefix + text.split('\n').join('\n' + prefix))
	}
	warn(text) {
		const prefix = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [WARN] `.yellow
		this.log(prefix + text.split('\n').join('\n' + prefix))
	}
	error(text) {
		const prefix = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] [ERROR] `.red
		this.log(prefix + text.split('\n').join('\n' + prefix))
	}
}

export default Logger
