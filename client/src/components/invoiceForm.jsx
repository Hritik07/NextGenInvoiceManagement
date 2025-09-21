import React, { useState } from "react";
import { escrowContract } from "../utils/blockchain";

export default function InvoiceForm() {
  const [invoice, setInvoice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hash = ethers.keccak256(ethers.toUtf8Bytes(invoice));
    const tx = await escrowContract.anchorInvoice(hash, "0xPAYER_ADDRESS", 100, "0xTOKEN_ADDRESS");
    await tx.wait();
    alert("Invoice anchored on blockchain!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={invoice} onChange={(e) => setInvoice(e.target.value)} />
      <button type="submit">Anchor Invoice</button>
    </form>
  );
}
