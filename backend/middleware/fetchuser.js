var jwt = require('jsonwebtoken');
const JWT_SECRET = '20lakhpackage9pointer';

const fetchuser = (req, res, next) =>{
    // Get the user from the jwd token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "please authenticate using a valid token"})
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
       next();
    
    } catch (error) {
        res.status(401).send({error: "please authenticate using a valid token"})
    }
}
   
module.exports = fetchuser;