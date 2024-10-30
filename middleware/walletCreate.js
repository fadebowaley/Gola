const Wallet = require("../models/wallet");
const Balance = require("../models/balance");

//Create wallet functions
async function createWallet(
  paymentId,
  userRef,
  amount,
  remarks,
  status,
  accountNumber,
  accountName, 
  payloads,
) {

  console.log("look up", payloads);
  console.log("look up, Transaction Location", payloads.TransactionLocation);
  console.log("look up SessionID", payloads.SessionID);

  return await Wallet.create({
    paymentId,
    userRef,
    amount,
    remarks, 
    status,
    accountNumber,
    accountName,
    //additional attributes -reconciliations
    statusCode:payloads.StatusCode,
    transactionLocation: payloads.TransactionLocation,
    sessionID: payloads.sessionID,
  });
}




async function updateBalance(userRef, amount) {
  let balance = await Balance.findOne({ userRef });
  if (!balance) {
    balance = await Balance.create({ userRef, balance: amount });
  } else {
    balance.balance += amount;
    await balance.save();
  }
  return balance;
}


//Customed inserted functions
async function handleExactAmount(
  paymentId,
  userRef,
  amount,
  remarks,
  accountNumber,
  accountName,
  payloads
) {
  await createWallet(
    paymentId,
    userRef,
    amount,
    remarks,
    "successful",
    accountNumber,
    accountName,
    payloads
  );
  return "1";
}

async function handleGreaterAmount(
  paymentId,
  userRef,
  amount,
  remarks,
  balanceAmount,
  accountNumber,
  accountName,
  payloads
) {
  await createWallet(
    paymentId,
    userRef,
    amount,
    remarks,
    "overpayment",
    accountNumber,
    accountName,
    payloads
  );
  await updateBalance(userRef, balanceAmount);
  return "1";
}

async function handleLesserAmount(
  paymentId,
  userRef,
  amount,
  remarks,
  accountNumber,
  accountName,
  payloads
) {
  await createWallet(
    paymentId,
    userRef,
    amount,
    remarks,
    "underpayment",
    accountNumber,
    accountName,
    payloads
  );
  await updateBalance(userRef, amount);
  return "1";
}

async function handleReclassAccount(
  paymentId,
  userRef,
  amount,
  remarks,
  accountNumber,
  accountName,
  payloads
) {
  await createWallet(
    paymentId,
    userRef,
    amount,
    remarks,
    "reclass-account",
    accountNumber,
    accountName,
    payloads
  );
  await updateBalance(userRef, amount);
  return "2";
}

async function handleDuplicate(
  paymentId,
  userRef,
  amount,
  remarks,
  accountNumber,
  accountName,
  payloads,
) {
  await createWallet(
    paymentId,
    userRef,
    amount,
    remarks,
    "duplicate",
    accountNumber,
    accountName,
    payloads
  );
  await updateBalance(userRef, amount);
  return "4";
}

async function getUserWallet(userId) {
  try {
    const userWallet = await Wallet.find({ userRef: userId }).lean();
    return userWallet;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw new Error("Unable to fetch user wallet");
  }
}

async function getUserBalance(userId) {
  try {
    const userBalance = await Balance.findOne({ userRef: userId }).lean();
    return userBalance ? userBalance.balance : 0;
  } catch (error) {
    console.error("Error fetching user balance:", error);
    throw new Error("Unable to fetch user balance");
  }
}

module.exports = {
  createWallet,
  handleExactAmount,
  handleGreaterAmount,
  handleLesserAmount,
  handleReclassAccount,
  handleDuplicate,
  getUserWallet,
  getUserBalance,
};
