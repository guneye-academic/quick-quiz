import { readDb, writeDb } from '../../../../lib/db';

export default function handler(req, res) {
  const { quizId } = req.query;

  if (req.method === 'POST') {
    const db = readDb();
    const session = db.sessions.find((s) => s.quizId === quizId);
    if (session) {
      session.participants = [];
      session.activeQuestion = null;
      session.started = false;
      writeDb(db);
      res.status(200).json({ message: 'Responses cleared successfully' });
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
