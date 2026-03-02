'use client';

import React from 'react';
import { Container, Typography, Button, TextField, Box, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

let socket;

const Admin = () => {
  const [quizTitle, setQuizTitle] = React.useState('');
  const [questions, setQuestions] = React.useState([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const router = useRouter();

  React.useEffect(() => {
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

    socket.on('quiz-created', () => {
      router.push('/admin/quizzes');
    });
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = () => {
    const quizData = { title: quizTitle, questions };
    socket.emit('create-quiz', quizData);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Quiz
          </Typography>
          
          <TextField
            label="Quiz Title"
            fullWidth
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          {questions.map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <TextField
                label={`Question ${qIndex + 1}`}
                fullWidth
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                sx={{ mb: 1 }}
              />
              {q.options.map((opt, oIndex) => (
                <TextField
                  key={oIndex}
                  label={`Option ${oIndex + 1}`}
                  fullWidth
                  value={opt}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  sx={{ mb: 1, mt: 1 }}
                />
              ))}
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                >
                  <MenuItem value={1}>Option 1</MenuItem>
                  <MenuItem value={2}>Option 2</MenuItem>
                  <MenuItem value={3}>Option 3</MenuItem>
                  <MenuItem value={4}>Option 4</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddQuestion} sx={{ mr: 2 }}>
            Add Question
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveQuiz}>
            Save Quiz
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default Admin;
