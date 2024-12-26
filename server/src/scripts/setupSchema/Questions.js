/**
  * This object contains Prompt ( https://www.npmjs.com/package/prompt ) style
  * questions that the SetupWizard will require an answer to. Questions are asked
  * in the order they are specified here.
  *
  * The resulting config.json file will be used by the server, accessed by the
  * name specified. IE, a valid use is; config.adminName
  *
  */

const Questions = {
  properties: {
    tripSalt: {
      description: 'Salt (leave as default)',
      type: 'string',
      hidden: true,
      replace: '*',
      before: (value) => {
        salt = value;
        return value;
      },
    },

    email: {
      description: 'Email',
      type: 'string',
      message: 'MrZhang365：请填好你的电子邮箱 我不想替你背锅（指你的聊天室报错 用户都联系我）'
    },

    adminTrip: {
      type: 'string',
      hidden: true,
      replace: '*',
      description: 'Admin Password',
      message: 'You must enter or re-enter a password',
      before: (value) => {
        const crypto = require('crypto');
        const sha = crypto.createHash('sha256');
        sha.update(value + salt);
        return sha.digest('base64').substr(0, 6);
      },
    },

    port: {
      type: 'integer',
      message: 'The port may only be a number!',
      description: 'HTTP Server Port',
      default: '3000',
    },

    enableXff: {
      type: 'boolean',
      message: 'You should enter true or false',
      description: 'Will you use reverse proxy servers, such as Nginx and CDN Services?',
      default: false,
    }
  },
};

module.exports = Questions;
