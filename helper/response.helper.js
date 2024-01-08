let success = (response, data, message, token) => {
    let successResponse = {
        status: 'Success',
        message: message
    };
    let status = 200;
    if (data) {
        successResponse = {
            ...successResponse,
            data: data
        };
    }

    response.status(status).json(successResponse);
};

let systemfailure = (response, err) => {
    let message = [
        'Error in handling this request. ',
        'Please contact system admin.'
    ].join('');

    let status = 500;

    if (typeof err === 'object' && err.message) {
        message = err.message;
    }

    response.status(status).json({
        status: 'Fail',
        systemfailure: true,
        message: message,
        data: null
    });
};

let requestfailure = (response, err, jsonerr = null) => {
    let status = 404;

    let message;
    if (typeof err === 'object' && err.message) {
        message = err.message;
    } else {
        message = err;
    }

    response.status(status).json({
        status: 'Fail',
        systemfailure: false,
        message: message,
        jsonerr: jsonerr
    });
};

let badRequest = (response, message) => {
    let status = 400;

    response.status(status).json({
        status: 'Fail',
        systemfailure: false,
        message: message,
        data: null
    });
};

module.exports = {
    success: success,
    badRequest,
    systemfailure: systemfailure,
    requestfailure: requestfailure
};
