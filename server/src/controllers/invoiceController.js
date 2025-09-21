let invoices = []; // simple in-memory DB for MVP

exports.createInvoice = async (req, res) => {
  const { invoiceHash, payer, amount, token } = req.body;
  const invoiceId = invoices.length;
  const invoice = { invoiceId, invoiceHash, payer, amount, token, status: "Created" };
  invoices.push(invoice);
  res.json({ success: true, invoice });
};

exports.getInvoices = async (req, res) => {
  res.json({ success: true, invoices });
};
