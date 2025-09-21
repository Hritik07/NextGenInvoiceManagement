import React from 'react';
import './App.css';

function App() {
  const [page, setPage] = React.useState('login');
  const [user, setUser] = React.useState(null);
  const [stats, setStats] = React.useState({ revenue: 0, invoices: 0, frauds: 0 });

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  React.useEffect(() => {
    if (user) {
      fetch("http://localhost:5000/api/invoices/stats")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, [user]);

  return (
    <div className="App">
      <Navbar setPage={setPage} handleLogout={handleLogout} user={user} />
      {page === 'login' && <Login handleLogin={handleLogin} setPage={setPage} />}
      {page === 'signup' && <Signup setPage={setPage} />}
      {page === 'dashboard' && user && <Dashboard stats={stats} />}
      {page === 'create-invoice' && <InvoiceForm setPage={setPage} />}
      <Footer />
    </div>
  );
}

// ---------------- Navbar ----------------
function Navbar({ setPage, handleLogout, user }) {
  return (
    <nav className="navbar">
      <h2>InvoiceChain</h2>
      <div>
        {user ? (
          <>
            <button onClick={() => setPage('dashboard')}>Dashboard</button>
            <button onClick={() => setPage('create-invoice')}>New Invoice</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')}>Login</button>
            <button onClick={() => setPage('signup')}>Signup</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ---------------- Login ----------------
function Login({ handleLogin, setPage }) {
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;

          fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                handleLogin(data.user);
              } else {
                alert(data.message);
              }
            })
            .catch(err => alert("Login failed: " + err.message));
        }}
      >
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <span onClick={() => setPage('signup')}>Sign up</span></p>
    </div>
  );
}

// ---------------- Signup ----------------
function Signup({ setPage }) {
  return (
    <div className="form-container">
      <h2>Signup</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const name = e.target.name.value;
          const email = e.target.email.value;
          const password = e.target.password.value;

          fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert("Signup successful! Please log in.");
                setPage('login');
              } else {
                alert("Error: " + data.message);
              }
            })
            .catch(err => alert("Signup failed: " + err.message));
        }}
      >
        <input type="text" name="name" placeholder="Full Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

// ---------------- Dashboard ----------------
function Dashboard({ stats }) {
  return (
    <div className="dashboard">
      <h2>Welcome to your Dashboard</h2>
      <div className="stats">
        <div className="card green">
          <h3>Total Revenue</h3>
          <p>${stats.revenue}</p>
        </div>
        <div className="card blue">
          <h3>Invoices Sent</h3>
          <p>{stats.invoices}</p>
        </div>
        <div className="card purple">
          <h3>Fraud Alerts</h3>
          <p>{stats.frauds}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------- Invoice Form ----------------
function InvoiceForm({ setPage }) {
  return (
    <div className="form-container">
      <h2>Create Invoice</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const clientName = e.target.clientName.value;
          const clientEmail = e.target.clientEmail.value;
          const amount = e.target.amount.value;

          fetch("http://localhost:5000/api/invoices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientName, clientEmail, amount })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                alert("Invoice created successfully and stored on blockchain!");
                setPage('dashboard');
              } else {
                alert("Error: " + data.message);
              }
            })
            .catch(err => alert("Failed: " + err.message));
        }}
      >
        <input type="text" name="clientName" placeholder="Client Name" required />
        <input type="email" name="clientEmail" placeholder="Client Email" required />
        <input type="number" name="amount" placeholder="Amount" required />
        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
}

// ---------------- Footer ----------------
function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 InvoiceChain - Blockchain Secured Invoicing</p>
    </footer>
  );
}

export default App;
