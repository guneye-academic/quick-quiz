import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

export default function handler(req, res) {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    const token = sign({
      // You can add more data to the token if needed
      isAdmin: true,
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const serialised = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    res.setHeader('Set-Cookie', serialised);
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
}
