'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Box, Paper } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

let socket;

const JoinQuiz = () => {
  const [name, setName] = useState('');
  const router = useRouter();
  const params = useParams();
  const { quizId } = params;

  useEffect(() => {
    socketInitializer();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io();

    socket.on('connect', () => {
      console.log('connected');
    });
  };

  const handleJoinQuiz = () => {
    const studentId = uuidv4();
    socket.emit('join-quiz', { quizId, studentId, name });
    router.push(`/quiz/${quizId}/${studentId}`);
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 2, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Join Quiz
        </Typography>
        <TextField
          label="Your Name or ID"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleJoinQuiz}>
          Join
        </Button>
      </Paper>
    </Container>
  );
};

export default JoinQuiz;
