const crypto = require('crypto');
export const createToken = () => {
  const token = crypto
    .createHash('sha256')
    .update(crypto.randomBytes(32))
    .digest('hex');
  return token;
};
