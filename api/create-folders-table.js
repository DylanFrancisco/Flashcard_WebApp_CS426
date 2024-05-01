import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
    try {
        const result = await sql`
            CREATE TABLE IF NOT EXISTS folders (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `;
        return response.status(200).json({ result });
    } catch (error) {
        return response.status(500).json({ error });
    }
}