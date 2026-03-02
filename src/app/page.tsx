'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Real-time Quiz App
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Link href="/admin/quizzes" passHref>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Admin Panel
            </Button>
          </Link>
          <Link href="/quiz/sample" passHref>
            <Button variant="outlined" color="secondary">
              Join Quiz (Sample)
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
