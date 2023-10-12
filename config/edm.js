module.exports = {
  mail: {
    activateCode: {
      subject: new Map([
        ['en', 'Verification email from Admin System'],
        ['zh-hans', ''],
      ]),
      text: new Map([
        ['en', '{{@url}}'],
        ['zh-hans', '{{@url}}'],
      ]),
      html: new Map([
        ['en', 'activate.html'],
        ['zh-hans', 'activate.html'],
      ]),
      landing: new Map([
        ['en', 'account/activate'],
        ['zh-hans', 'account/activate'],
      ]),
    },
    resetPassword: {
      subject: new Map([
        ['en', 'Reset password request from Admin System'],
        ['zh-hans', '要求重设密码'],
      ]),
      text: new Map([
        ['en', 'Please click the link to reset your password: {{@url}}'],
        ['zh-hans', '按以下連結以重设密码: {{@url}}'],
      ]),
      html: new Map([
        ['en', 'en/reset-password.html'],
        ['zh-hans', 'zh-hans/reset-password.html'],
      ]),
      landing: new Map([
        ['en', 'en/reset-password'],
        ['zh-hans', 'zh-hans/reset-password'],
      ]),
    },
    username: {
      subject: new Map([
        ['en', 'Your registered username in Admin System'],
      ]),
      text: new Map([
        ['en', '{{@username}}'],
      ]),
      html: new Map([
        ['en', 'en/username.html'],
      ]),
    },
  },
};
