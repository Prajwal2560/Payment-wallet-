import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { email, password };

    axios.post('http://localhost:5000/api/login', user)
      .then(res => {
        const { upi_id, message ,balance} = res.data;

        // Store user info in local storage
		console.log(">>>>>.",upi_id)
        localStorage.setItem('user', JSON.stringify({ email, upi_id, balance }));

        alert(message);
        navigate('/transaction'); // Navigate to the transaction page
		window.location.reload();
      })
      .catch(err => alert('Error logging in'));
  };

  return (
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
      <div classe="row">
        <div class="">
          <div class="card p-4 shadow-sm">
            <h2 class="card-title mb-4 text-center">LOGIN</h2>
            <form onSubmit={handleSubmit}>
              <div class="mb-3">
                <label htmlFor="email" class="form-label">E-Mail</label>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div class="mb-3">
                <label htmlFor="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">
                Submit
              </button>
            </form>
            <p class="mt-3 text-center">
              Don't have an account? <Link to="/signup" class="link-primary">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}