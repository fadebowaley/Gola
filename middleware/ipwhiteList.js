 // whitelist.js
const allowedIPs = [
   '154.113.166.67'
];

function ipWhitelist(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (allowedIPs.includes(clientIp)) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Forbidden: IP not allowed" });
  }
}

module.exports = ipWhitelist;
