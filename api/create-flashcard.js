import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
//console.log('response', response);
  try {
    const cardId = request.query.cardId;
    const cardTitle = request.query.cardTitle;
    const cardDef = request.query.cardDef;
    const setId = request.query.setId;
    if (!cardId) throw new Error('Something null');
    await sql`INSERT INTO flashcards (ID, term, Definition, set_id) VALUES (${cardId}, ${cardTitle}, ${cardDef}, ${setId});`;
    
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const sets = await sql`SELECT * FROM sets;`;
  response.status(200).json({ sets });
}