import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
console.log('request.query', request.query);
console.log('response', response);
  try {
    const folderId = request.query.folderId;
    const folderName = request.query.folderName;
    if (!folderId || !folderName) throw new Error('');
    await sql`INSERT INTO Folders (ID, Name) VALUES (${folderId}, ${folderName});`;
  } catch (error) {
    return response.status(500).json({ error });
  }
 
  const folders = await sql`SELECT * FROM Folders;`;
  response.status(200).json({ folders });
}
