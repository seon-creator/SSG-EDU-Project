const jwt = require('jsonwebtoken');

const verifyToken = (token, secretKey) => {
    var decode = null;
    jwt.verify(token, secretKey, function (err, res) {
        if (err) {
            console.log("토큰 검증 중 오류 발생 >> ", err);
            return;
        }
        decode = res
    });
    return decode;
}

module.exports = {
    verifyToken,
}