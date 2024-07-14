import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../../config';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    phone_no: '',
    bio: '',
    dob: '',
    address: '',
    profile_image: null
  });

  const handleChange = (e) => {
    if (e.target.name === 'profile_image') {
      setFormData({ ...formData, profile_image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('firstname', formData.firstname);
    data.append('lastname', formData.lastname);
    data.append('email', formData.email);
    data.append('phone_no', formData.phone_no);
    data.append('bio', formData.bio);
    data.append('dob', formData.dob);
    data.append('address', formData.address);
    if (formData.profile_image) {
      data.append('profile_image', formData.profile_image);
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      console.log('Success:', result);
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <h1 className='title'>Registration Form</h1>
      <div className="form-container">
        <form method='post' onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" onChange={handleChange} value={formData.username} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" onChange={handleChange} value={formData.password} required />
          </div>
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input type="text" id="firstname" name="firstname" onChange={handleChange} value={formData.firstname} required />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input type="text" id="lastname" name="lastname" onChange={handleChange} value={formData.lastname} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" onChange={handleChange} value={formData.email} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone_no">Phone Number</label>
            <input type="tel" id="phone_no" name="phone_no" onChange={handleChange} value={formData.phone_no} required />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" onChange={handleChange} value={formData.bio}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input type="date" id="dob" name="dob" onChange={handleChange} value={formData.dob} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" onChange={handleChange} value={formData.address}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="profile_image">Profile Image</label>
            <input type="file" id="profile_image" name="profile_image" onChange={handleChange} accept="image/*" />
          </div>
          <input type="submit" value="Register" />
          <p>Already have an account? <Link to='/login'>Login</Link></p>
        </form>
      </div>
    </div>
  );
}

export default Register;
