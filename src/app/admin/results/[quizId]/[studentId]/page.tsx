'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useParams } from 'next/navigation';
import Header from '../../../../../components/Header';

const StudentResultsPage = () => {
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const params = useParams();
  const quizId = params?.quizId as string;
  const studentId = params?.studentId as string;

  useEffect(() => {
    if (quizId && studentId) {
      fetch(`/api/sessions/${quizId}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((session) => {
          if (session && session.participants) {
            const currentStudent = session.participants.find((p) => p.id === studentId);
            setStudent(currentStudent);
          }
        });

      fetch(`/api/quizzes`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((quizzes) => {
          const currentQuiz = quizzes.find((q) => q.id === quizId);
          setQuiz(currentQuiz);
        });
    }
  }, [quizId, studentId]);

  if (!student || !quiz) {
    return <Container>Loading...</Container>;
  }

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Results for {student.name}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question No.</TableCell>
                  <TableCell>Question</TableCell>
                  <TableCell>Student's Response</TableCell>
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
                      <TableCell>{q.text}</TableCell>
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
        </Paper>
      </Container>
    </>
  );
};

export default StudentResultsPage;
