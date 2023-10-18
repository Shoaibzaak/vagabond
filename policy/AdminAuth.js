var Services = require('../services/index');
var Model = require('../models/index');
module.exports = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        console.log(parts)
        if(parts.length !== 2) return res.status(401).send({code: 'FAILED', message: 'Invalid Token'});
        var userType = parts[0];
        if (userType !== 'GHA') return res.status(401).send({code: 'Failed', message: 'Unauthorized request'});
        var  token = parts[1];
        Services.JwtService.verify(token, (error, user) => {
            if(error) return res.forbidden('Access Denied');
            console.log(user)
            var query = {_id: user.id};
            console.log(query)
            Model.Admin.findOne(query).then(user => {
                if (!user) return res.forbidden('Unauthorized request');
                req.user = user;
                next();
            });
        });
    } else {
        return res.status(401).send({code: 'FAILED', message: 'Token Missing'});
    }
};
