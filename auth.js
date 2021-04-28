const User = require('./modal/db');

const auth = async (req, res, next) => {
    try
    {
        const data = req.cookies.token;
        const token = User.findOne({token: data});

        if(token)
        {
            next();
        }
    }
    catch(e)
    {
        res.status(401).render('login');
        console.log(e)
    }

}

module.exports = auth;