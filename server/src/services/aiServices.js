// Dummy anomaly detection for invoices
export const detectFraud = (invoiceData) => {
  const { amount, dueDate } = invoiceData;

  // Example rule-based + ML placeholder
  if (amount > 1000000) {
    return { isFraud: true, reason: "Suspiciously large amount" };
  }
  if (new Date(dueDate) < new Date()) {
    return { isFraud: true, reason: "Invoice due date already passed" };
  }

  return { isFraud: false };
};
