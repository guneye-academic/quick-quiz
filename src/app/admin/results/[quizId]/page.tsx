'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/Header';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const params = useParams();
  const quizId = params?.quizId as string;

  useEffect(() => {
    if (quizId) {
      fetch(`/api/sessions/${quizId}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((session) => {
          if (session && session.participants) {
            const calculatedResults = session.participants.map((p) => {
              const score = p.answers.filter((a) => a.isCorrect).length;
              const totalTime = p.answers.reduce((acc, a) => acc + a.responseTime, 0);
              return {
                id: p.id,
                name: p.name,
                score,
                totalTime,
              };
            });

            calculatedResults.sort((a, b) => {
              if (a.score !== b.score) {
                return b.score - a.score;
              }
              return a.totalTime - b.totalTime;
            });

            setResults(calculatedResults);
          }
        });
    }
  }, [quizId]);

  return (
    <>
      <Header />
      <Container maxWidth="md">
        <Paper sx={{ p: 2, my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quiz Results
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
                    <TableCell>
                      <Link href={`/admin/results/${quizId}/${r.id}`} passHref>
                        {r.name}
                      </Link>
                    </TableCell>
                    <TableCell>{r.score}</TableCell>
                    <TableCell>{(r.totalTime / 1000).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
};

export default ResultsPage;
