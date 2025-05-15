// Debug middleware to log session and request information
export const debugSession = (req, res, next) => {
  console.log('\n--- DEBUG SESSION INFO ---');
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  console.log('User in Session:', req.session.user);
  console.log('Original URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('--- END DEBUG INFO ---\n');
  next();
};

// Debug middleware specifically for the login route
export const debugLogin = (req, res, next) => {
  if (req.method === 'POST' && req.originalUrl === '/auth/login') {
    console.log('\n--- DEBUG LOGIN REQUEST ---');
    console.log('Login Attempt:');
    console.log('- Email:', req.body.email);
    console.log('- Password Length:', req.body.password ? req.body.password.length : 0);
    console.log('--- END DEBUG LOGIN INFO ---\n');
  }
  next();
}; 