'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Paper, Box, IconButton } from '@mui/material';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Header from '../../../components/Header';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzes = () => {
    fetch('/api/quizzes', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data);
      });
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      }
    }
  };

  const handleClearResponses = async (quizId) => {
    if (confirm('Are you sure you want to clear all responses for this quiz?')) {
      await fetch(`/api/sessions/${quizId}/clear`, {
        method: 'POST',
      });
      fetchQuizzes();
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Available Quizzes
            </Typography>
            <Link href="/admin" passHref>
              <Button variant="contained" color="primary">
                Create New Quiz
              </Button>
            </Link>
          </Box>
          <List>
            {quizzes.map((quiz) => (
              <ListItem key={quiz.id} secondaryAction={
                <>
                  <IconButton edge="end" aria-label="clear responses" onClick={() => handleClearResponses(quiz.id)}>
                    <AutorenewIcon />
                  </IconButton>
                  <Link href={`/admin/edit/${quiz.id}`} passHref>
                    <IconButton edge="end" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(quiz.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <Link href={`/admin/results/${quiz.id}`} passHref>
                    <Button variant="contained" color="primary" sx={{ ml: 2 }}>
                        Results
                    </Button>
                  </Link>
                  <Link href={`/admin/start/${quiz.id}`} passHref>
                    <Button variant="contained" color="secondary" sx={{ ml: 2 }}>
                      Start
                    </Button>
                  </Link>
                </>
              }>
                <ListItemText primary={`${quiz.title} (${quiz.responseCount} responses)`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
};

export default QuizListPage;
