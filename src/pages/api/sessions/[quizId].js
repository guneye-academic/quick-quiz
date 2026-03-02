import { readDb } from '../../../lib/db';

export default function handler(req, res) {
  const { quizId } = req.query;
  const db = readDb();
  const session = db.sessions.find((s) => s.quizId === quizId);

  if (session) {
    res.status(200).json(session);
  } else {
    res.status(404).json({ message: 'Session not found' });
  }
}
