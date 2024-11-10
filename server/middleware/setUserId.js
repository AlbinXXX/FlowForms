module.exports = (req, res, next) => {
    if (req.user) {
        req.userId = req.user.id;
    }
    next();
};
