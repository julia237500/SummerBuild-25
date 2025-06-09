import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
<<<<<<< Updated upstream
  const [email, setEmail] = useState('');
=======
>>>>>>> Stashed changes
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
<<<<<<< Updated upstream
    if (email === 'admin@abc.com' && password === 'admin123') {
=======
    if (password === 'admin123') {
>>>>>>> Stashed changes
      navigate('/admin/dashboard');
    } else {
      alert('Wrong password');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
<<<<<<< Updated upstream
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
=======
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
>>>>>>> Stashed changes
        </div>
        <button className="btn btn-primary mt-3">Login</button>
      </form>
    </div>
  );
}
