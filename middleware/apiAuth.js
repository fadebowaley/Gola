// authMiddleware.js
const basicAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      ...req.body,
      StatusCode: "3"
    });
  }

  const auth = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  const [username, password] = auth;
  
  const user_name= process.env.API_USERNAME;
  const pass_key= process.env.API_PASSWORD;

  console.log(user_name);
  console.log(username);

  const validUsername = user_name;
  const validPassword = pass_key;
  if (username === validUsername && password === validPassword) {
    next();
  } else {
    console.log('name not correct . . . . .');
    res.status(403).json({
      ...req.body,
      StatusCode: "3"
    });
  }
};

module.exports = basicAuth;
