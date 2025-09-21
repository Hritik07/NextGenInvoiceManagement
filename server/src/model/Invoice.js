import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  buyer: String,
  seller: String,
  amount: Number,
  dueDate: Date,
  hash: String,   // blockchain hash
  status: { type: String, default: "PENDING" }
});

export default mongoose.model("Invoice", invoiceSchema);
