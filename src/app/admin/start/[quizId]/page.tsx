'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import Header from '../../../../components/Header';

let socket;

const StartQuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [origin, setOrigin] = useState('');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [responseStatus, setResponseStatus] = useState({ respondedCount: 0, totalParticipants: 0 });
  const params = useParams();
  const { quizId } = params;

  useEffect(() => {
    setOrigin(window.location.origin);

    fetch(`/api/quizzes`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((quizzes) => {
        const currentQuiz = quizzes.find((q) => q.id === quizId);
        setQuiz(currentQuiz);
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

    socket.on('quiz-started', () => {
      setQuizStarted(true);
    });

    socket.on('update-participants', (newParticipants) => {
      setParticipants(newParticipants);
    });

    socket.on('results-update', (newResults) => {
      setResults(newResults);
      setShowResults(true);
    });

    socket.on('question-is-active', ({ questionIndex }) => {
      setActiveQuestionIndex(questionIndex);
    });

    socket.on('response-status-update', (status) => {
      setResponseStatus(status);
    });
  };

  const handleStartQuiz = () => {
    socket.emit('start-quiz', { quizId });
  };

  const handleActivateQuestion = (questionIndex) => {
    socket.emit('activate-question', { quizId, questionIndex });
  };

  const handleShowResults = () => {
    socket.emit('show-results', { quizId });
  };

  if (!quiz) {
    return <Container>Loading...</Container>;
  }

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {quiz.title}
          </Typography>

          {!quizStarted && !showResults && (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Waiting for participants...
              </Typography>
              <Typography variant="body1">
                Quiz URL: {origin}/quiz/{quizId}
              </Typography>
              {origin && <Box sx={{ my: 2 }}>
                <QRCode value={`${origin}/quiz/${quizId}`} />
              </Box>}
              <Typography variant="h6">Participants ({participants.length})</Typography>
              <List>
                {participants.map((p) => (
                  <ListItem key={p.id}>
                    <ListItemText primary={p.name} />
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" color="secondary" onClick={handleStartQuiz}>
                Start Quiz
              </Button>
            </Box>
          )}

          {quizStarted && !showResults && (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Quiz In Progress
              </Typography>
              <Typography variant="h6">Participants ({participants.length})</Typography>
              <List>
                {participants.map((p) => (
                  <ListItem key={p.id}>
                    <ListItemText primary={p.name} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6">Questions</Typography>
              <List>
                {quiz.questions.map((q, i) => (
                  <ListItem key={i} secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {activeQuestionIndex === i && (
                        <Typography sx={{ mr: 2 }}>
                          ({responseStatus.respondedCount}/{responseStatus.totalParticipants})
                        </Typography>
                      )}
                      <Button 
                        variant="contained" 
                        onClick={() => handleActivateQuestion(i)}
                        disabled={activeQuestionIndex === i}
                      >
                        {activeQuestionIndex === i ? 'Active' : 'Activate'}
                      </Button>
                    </Box>
                  }>
                    <ListItemText primary={q.text} />
                  </ListItem>
                ))}
              </List>
              <Button variant="contained" color="error" onClick={handleShowResults} sx={{ mt: 2 }}>
                Show Results
              </Button>
            </Box>
          )}

          {showResults && (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Final Results
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Total Time (s)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.score}</TableCell>
                        <TableCell>{(r.totalTime / 1000).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Container>
    </>
  );
};

export default StartQuizPage;
