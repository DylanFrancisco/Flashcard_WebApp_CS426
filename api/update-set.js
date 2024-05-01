import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
//console.log('response', response);
  try {
    const setId = request.query.setId;
    const setTitle = request.query.setTitle;
    const setDescription = request.query.setDescription;
    if (!setId ) throw new Error('Something null');
    await sql`UPDATE sets SET Title = ${setTitle}, Description = ${setDescription} WHERE ID = ${setId};`;
    
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const sets = await sql`SELECT * FROM sets;`;
  response.status(200).json({ sets });
}