const { getUserBalance } = require("../middleware/walletCreate");

const globalBalance = async (req, res, next) => {
  try {
    if (req.user) {
      const balance = await getUserBalance(req.user._id);
      res.locals.balance = balance;
    } else {
      res.locals.balance = 0; // Default balance if the user is not authenticated
    }
    next();
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.locals.balance = 0; // Default balance if there's an error
    next();
  }
};

module.exports = globalBalance;
