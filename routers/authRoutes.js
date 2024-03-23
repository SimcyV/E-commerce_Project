const express = require('express');
const axios = require('axios');
const router = express.Router();
const user = require('../models/user_schema')

const CLIENT_ID = '66294555605-h51ju12anina4batcsaegcm7logslvqk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});


// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    const { access_token, id_token } = data;
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // code for retrive user data
    const { id, name, email } = profile;
    console.log(id, name, email);

    let users = await user.findOne({ email });

    if (!users) {
      users = new user({
        name: name,
        email: email
        // password: id
      });
      await users.save();
    }
    req.session.login = true;
    req.session.userEmail = email;
    


    res.redirect('/dashboard');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
        console.error('Error:', error.response.data.error);
      } else {
        console.error('Error:', error.message);
      }
      res.redirect('/');
    }
});

// Logout route
router.get('/logout', (req, res) => {
  // Code to handle user logout
  res.redirect('/login');
});

module.exports = router;