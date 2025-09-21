import React, { useEffect, useState } from "react";
import axios from "axios";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices");
        setInvoices(res.data.invoices);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    }

    fetchInvoices();
  }, []);

  return (
    <div>
      <h2>All Invoices</h2>
      {invoices.length === 0 && <p>No invoices yet.</p>}
      <ul>
        {invoices.map(inv => (
          <li key={inv.invoiceId}>
            <strong>ID:</strong> {inv.invoiceId} | <strong>Hash:</strong> {inv.invoiceHash} | <strong>Status:</strong> {inv.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
