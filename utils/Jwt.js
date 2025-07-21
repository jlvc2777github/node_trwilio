const jwt = require("jsonwebtoken");

const SECRET_KEY = "SOME_SECRET_STRING";

function createJwt(username){
    const token = jwt.sign({username},SECRET_KEY);
    //console.log(token);
    return token;
}

function verifyToken(token){
    const data = jwt.verify(token,SECRET_KEY);
    return data;
}

module.exports = {
    createJwt,
    verifyToken,
}

