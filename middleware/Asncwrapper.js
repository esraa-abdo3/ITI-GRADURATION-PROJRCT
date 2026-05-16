module.exports = (Asynfn) => {
    return (req, res, next) => {
        Asynfn(req, res, next).catch((err) => {
            next(err);
        });
    }
    
}