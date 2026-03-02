import { readDb } from '../../lib/db';

export default function handler(req, res) {
  const db = readDb();
  const quizzesWithResponseCount = db.quizzes.map((quiz) => {
    const session = db.sessions.find((s) => s.quizId === quiz.id);
    let responseCount = 0;
    if (session && session.participants) {
      responseCount = session.participants.filter((p) => p.answers.length > 0).length;
    }
    return {
      ...quiz,
      responseCount,
    };
  });
  res.status(200).json(quizzesWithResponseCount);
}
