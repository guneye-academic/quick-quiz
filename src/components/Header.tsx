'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Quiz App Admin
        </Typography>
        <Link href="/" passHref>
          <Button color="inherit">Home</Button>
        </Link>
        <Link href="/admin/quizzes" passHref>
          <Button color="inherit">Quizzes</Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
