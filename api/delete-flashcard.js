import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
  try {
    const cardId = request.query.cardId;
    if (!cardId) throw new Error('one or more parameters are null');
    await sql `DELETE FROM flashcards WHERE ID = ${cardId}`;
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const cards = await sql`SELECT * FROM flashcards;`;
  response.status(200).json({ cards });
}