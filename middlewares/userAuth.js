const user = require("../models/user_schema")

module.exports = {

 verifyUser: async (req, res, next) => {
        if (req.session.login) {
            const username = req.session.userEmail;
            const newUser = await user.findOne({ email: username });
            if (newUser && newUser.status === 'Blocked') {
                req.session.login = false;
                return res.redirect('/signin');
            }
            next();
        } else {
            res.redirect("/");
        }
    },


   userExist : (req, res, next) => {
      if (req.session.login) {
        res.redirect("/dashboard");
      } else {
        next();
      }
    },
    
}
