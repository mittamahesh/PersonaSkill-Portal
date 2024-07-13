import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div>
      <div className="header-container">
        <h1>Welcome</h1>
        <div>
          {isLoggedIn ? (
            <Link to='/'> <button onClick={logout} className='logout'>Logout</button> </Link>
          ) : (
            <>
              <Link to="/login" className='login'>Login</Link>
              <Link to="/register" className='register'>Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
