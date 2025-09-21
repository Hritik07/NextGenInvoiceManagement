let users = []; // In-memory user store for MVP

exports.registerUser = async (req, res) => {
  const { name, email, walletAddress } = req.body;

  // Basic validation
  if (!name || !email || !walletAddress) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  // Check if user already exists
  const existing = users.find(u => u.walletAddress === walletAddress);
  if (existing) {
    return res.status(400).json({ success: false, message: "User already registered" });
  }

  const user = { id: users.length, name, email, walletAddress };
  users.push(user);
  res.json({ success: true, user });
};

exports.getUsers = async (req, res) => {
  res.json({ success: true, users });
};
