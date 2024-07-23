import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
//console.log('response', response);
  try {
    const setId = request.query.setId;
    const setName = request.query.setName;
    const setTitle = request.query.setTitle;
    const setDescription = request.query.setDescription;
    const folderId = request.query.folderId;
    if (!folderId || !setId || !setName) throw new Error('Something null');
    await sql`INSERT INTO sets (ID, Name, Title, Description, folder_id) VALUES (${setId}, ${setName}, ${setTitle}, ${setDescription}, ${folderId});`;
    
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const sets = await sql`SELECT * FROM sets;`;
  response.status(200).json({ sets });
}