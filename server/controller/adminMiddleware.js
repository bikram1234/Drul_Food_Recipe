var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/admin");
};

module.exports = middlewareObj;