var jwt = require('jsonwebtoken');
var SECRETKEY = require('../config/config').TOKENSECRET;
var issue  = payload => {
    return jwt.sign(
        payload,
        SECRETKEY,
        // {expiresIn: 60 * 60 * 24 * 7}
    );
};
var verify = (token, cb) => {
    return jwt.verify(token, SECRETKEY, {}, cb);
};
module.exports = {
    issue: issue,
    verify: verify
};
