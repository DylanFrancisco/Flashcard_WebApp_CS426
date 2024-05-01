import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
//console.log('response', response);
  try {
    const cardId = request.query.cardId;
    const cardTitle = request.query.cardTitle;
    const cardDef = request.query.cardDef;
    if (!cardId ) throw new Error('Something null');
    await sql`UPDATE flashcards SET term = ${cardTitle}, definition = ${cardDef} WHERE ID = ${cardId};`;
    
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const cards = await sql`SELECT * FROM flashcards;`;
  response.status(200).json({ cards });
}