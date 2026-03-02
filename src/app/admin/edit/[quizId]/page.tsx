'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Box, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import io from 'socket.io-client';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';

let socket;

const EditQuizPage = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const router = useRouter();
  const params = useParams();
  const { quizId } = params;

  useEffect(() => {
    fetch(`/api/quizzes`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((quizzes) => {
        const currentQuiz = quizzes.find((q) => q.id === quizId);
        if (currentQuiz) {
          setQuizTitle(currentQuiz.title);
          setQuestions(currentQuiz.questions);
        }
      });

    socketInitializer();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [quizId]);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io();

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('quiz-updated', () => {
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

  const handleSaveChanges = () => {
    const quizData = { id: quizId, title: quizTitle, questions };
    socket.emit('update-quiz', quizData);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Quiz
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
          <Button variant="contained" color="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default EditQuizPage;
