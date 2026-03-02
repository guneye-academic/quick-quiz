import { Server } from 'socket.io';
import { readDb, writeDb } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

      socket.on('create-quiz', (data) => {
        const db = readDb();
        const newQuiz = {
          id: uuidv4(),
          ...data,
        };
        const newSession = {
          id: uuidv4(),
          quizId: newQuiz.id,
          participants: [],
          activeQuestion: null,
          started: false,
        };
        db.quizzes.push(newQuiz);
        db.sessions.push(newSession);
        writeDb(db);
        socket.emit('quiz-created', { quizId: newQuiz.id, sessionId: newSession.id });
      });

      socket.on('start-quiz', ({ quizId }) => {
        const db = readDb();
        const session = db.sessions.find((s) => s.quizId === quizId);
        if (session) {
          session.started = true;
          writeDb(db);
          io.emit('quiz-started', { quizId, sessionId: session.id });
        }
      });

      socket.on('join-quiz', ({ quizId, studentId, name }) => {
        const db = readDb();
        const session = db.sessions.find((s) => s.quizId === quizId);
        if (session) {
          session.participants.push({ id: studentId, name, answers: [] });
          writeDb(db);
          io.emit('update-participants', session.participants);
        }
      });

      socket.on('activate-question', ({ quizId, questionIndex }) => {
        const db = readDb();
        const quiz = db.quizzes.find((q) => q.id === quizId);
        const session = db.sessions.find((s) => s.quizId === quizId);

        if (quiz && session) {
          const question = quiz.questions[questionIndex];
          session.activeQuestion = {
            index: questionIndex,
            text: question.text,
            options: question.options,
            activationTime: Date.now(),
          };
          writeDb(db);

          const questionForStudent = {
            index: questionIndex,
            text: question.text,
            options: question.options,
            totalQuestions: quiz.questions.length,
          };

          io.emit('question-activated', questionForStudent);
          io.emit('question-is-active', { questionIndex });
          io.emit('response-status-update', {
            respondedCount: 0,
            totalParticipants: session.participants.length,
          });
        }
      });

      socket.on('submit-answer', ({ quizId, studentId, questionIndex, answer }) => {
        const db = readDb();
        const session = db.sessions.find((s) => s.quizId === quizId);
        if (session) {
          const participant = session.participants.find((p) => p.id === studentId);
          const quiz = db.quizzes.find((q) => q.id === quizId);
          if (participant && quiz) {
            const question = quiz.questions[questionIndex];
            // Check if user already answered
            const alreadyAnswered = participant.answers.some(a => a.questionIndex === questionIndex);
            if(alreadyAnswered) return;

            const responseTime = Date.now() - session.activeQuestion.activationTime;
            const correctAnswerIndex = question.correctAnswer - 1;
            const correctAnswerText = question.options[correctAnswerIndex];
            const isCorrect = correctAnswerText === answer;
            participant.answers.push({
              questionIndex,
              answer,
              isCorrect,
              responseTime,
            });
            writeDb(db);

            const respondedCount = session.participants.filter((p) =>
              p.answers.some((a) => a.questionIndex === questionIndex)
            ).length;

            io.emit('response-status-update', {
              respondedCount,
              totalParticipants: session.participants.length,
            });
          }
        }
      });

      socket.on('show-results', ({ quizId }) => {
        const db = readDb();
        const session = db.sessions.find((s) => s.quizId === quizId);
        if (session) {
          const results = session.participants.map((p) => {
            const score = p.answers.filter((a) => a.isCorrect).length;
            const totalTime = p.answers.reduce((acc, a) => acc + a.responseTime, 0);
            return {
              id: p.id,
              name: p.name,
              score,
              totalTime,
            };
          });

          results.sort((a, b) => {
            if (a.score !== b.score) {
              return b.score - a.score;
            }
            return a.totalTime - b.totalTime;
          });

          io.emit('results-update', results);
        }
      });

      socket.on('update-quiz', (data) => {
        const db = readDb();
        const quizIndex = db.quizzes.findIndex((q) => q.id === data.id);
        if (quizIndex !== -1) {
          db.quizzes[quizIndex] = data;
          writeDb(db);
          socket.emit('quiz-updated');
        }
      });
    });
  }
  res.end();
}
