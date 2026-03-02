import { readDb, writeDb } from '../../../lib/db';

export default function handler(req, res) {
  const { quizId } = req.query;

  if (req.method === 'DELETE') {
    const db = readDb();
    const quizIndex = db.quizzes.findIndex((q) => q.id === quizId);
    if (quizIndex === -1) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    db.quizzes.splice(quizIndex, 1);

    const sessionIndex = db.sessions.findIndex((s) => s.quizId === quizId);
    if (sessionIndex !== -1) {
      db.sessions.splice(sessionIndex, 1);
    }

    writeDb(db);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
