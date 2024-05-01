import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
  try {
    const setId = request.query.setId;
    if (!setId) throw new Error('one or more parameters are null');
    await sql `DELETE FROM sets WHERE ID = ${setId}`;
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const sets = await sql`SELECT * FROM sets;`;
  response.status(200).json({ sets });
}