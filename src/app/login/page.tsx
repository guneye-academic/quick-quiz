'use client';

import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/quizzes');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ p: 2, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Login
        </Typography>
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          sx={{ mb: 2 }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Container>
  );
};

export default LoginPage;
