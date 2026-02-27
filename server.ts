import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// API Routes
app.get('/api/auth/url', (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured' });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: redirectUri // Pass redirectUri in state so we can use it in callback
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.json({ url: authUrl });
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = state as string;

  if (!code || !redirectUri) {
    return res.status(400).send('Missing code or state');
  }

  try {
    // Exchange code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const { access_token, id_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userInfoResponse.data;

    // Create a session token
    const sessionToken = jwt.sign({ id: user.id, email: user.email, name: user.name, picture: user.picture }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('session', sessionToken, {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.session;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session', {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  });
  res.json({ success: true });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
