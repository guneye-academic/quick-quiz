'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';

const StudentQuizPage = () => {
  const [question, setQuestion] = useState(null);
  const [waiting, setWaiting] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const params = useParams();
  const quizId = params.quizId as string;
  const studentId = params.studentId as string;
  const socket = useRef(null);

  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`/api/quizzes`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((quizzes) => {
          const currentQuiz = quizzes.find((q) => q.id === quizId);
          setQuiz(currentQuiz);
        });
        
    socketInitializer();
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [quizId]);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket.current = io();

    socket.current.on('connect', () => {
      console.log('connected');
      socket.current.emit('join-quiz-page', { quizId, studentId });
    });

    socket.current.on('question-activated', (activeQuestion) => {
      setQuestion(activeQuestion);
      setWaiting(false);
      setQuizCompleted(false);
    });

    socket.current.on('results-update', (results) => {
      fetch(`/api/sessions/${quizId}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((session) => {
          if (session && session.participants) {
            const currentStudent = session.participants.find((p) => p.id === studentId);
            setStudent(currentStudent);
          }
        });

      const myResult = results.find((r) => r.id === studentId);
      setResult(myResult);
      setWaiting(false);
      setQuestion(null);
      setQuizCompleted(false);
    });
  };

  const handleAnswerSubmit = (answer) => {
    socket.current.emit('submit-answer', {
      quizId,
      studentId,
      questionIndex: question.index,
      answer,
    });
    setWaiting(true);
    if (question.index + 1 === question.totalQuestions) {
      setQuizCompleted(true);
    }
    setQuestion(null);
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 2, my: 4 }}>
        {waiting && !result && !quizCompleted &&(
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Waiting for the next question...
            </Typography>
          </Box>
        )}
        {quizCompleted && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Quiz completed! waiting for the results to be published
                </Typography>
            </Box>
        )}
        {!waiting && question && (
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {question.text}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="contained"
                  onClick={() => handleAnswerSubmit(option)}
                >
                  {option}
                </Button>
              ))}
            </Box>
          </Box>
        )}
        {result && student && quiz && (
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Your Results
            </Typography>
            <Typography variant="h6">Score: {result.score}</Typography>
            <Typography variant="h6">Total Time: {(result.totalTime / 1000).toFixed(2)}s</Typography>

            <TableContainer component={Paper} sx={{ mt: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question No.</TableCell>
                    <TableCell>Your Response</TableCell>
                    <TableCell>Correct Answer</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Response Time (s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quiz.questions.map((q, i) => {
                    const answer = student.answers.find((a) => a.questionIndex === i);
                    const correctAnswerText = q.options[q.correctAnswer - 1];
                    return (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{answer ? answer.answer : 'Not Answered'}</TableCell>
                        <TableCell>{correctAnswerText}</TableCell>
                        <TableCell>{answer ? (answer.isCorrect ? 'Correct' : 'False') : '-'}</TableCell>
                        <TableCell>{answer ? (answer.responseTime / 1000).toFixed(2) : '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StudentQuizPage;
