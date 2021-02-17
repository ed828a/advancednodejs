const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  // this allows route handler run first, after it finish and return, we run clearHash()
  await next(); 
  try {
    clearHash(req.user.id)
  } catch (error) {
    console.error(error.message)
  }      
};