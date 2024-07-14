const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://personaskill-portal.onrender.com'  // Replace with your Render URL
  : 'http://localhost:5000';

export default API_URL;