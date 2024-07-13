import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        if (!username && !password) {
            setErrorMessage('Please enter username and password');
            return;
        } else if (!username) {
            setErrorMessage('Please enter username');
            return;
        } else if (!password) {
            setErrorMessage('Please enter password');
            return;
        }

        const data = { username, password };

        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Login failed');
                return response.json();
            })
            .then((data) => {
                login(data.token);
                console.log(data.token)
                navigate('/dashboard');
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Login failed');
            });
    };

    return (
        <div>
            <h1 className="title">Login Page</h1>
            <div className="form-container">
                <form method="post" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" />
                    </div>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <input type="submit" value="Login" />
                    <p>
                        Create a new Account? <Link to="/register">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;