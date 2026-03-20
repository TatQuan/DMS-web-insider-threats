// Function to convert IPv6-mapped IPv4 to standard IPv4
const formatIPv4 = (ip) => {
  if (!ip) return "0.0.0.0";

  // If it's localhost IPv6 (::1) -> return 127.0.0.1
  if (ip === "::1") return "127.0.0.1";

  // If it's IPv4-mapped IPv6 (format ::ffff:192.168.1.1)
  if (ip.includes("::ffff:")) {
    return ip.split(":").pop();
  }

  return ip;
};

module.exports = { formatIPv4 };
