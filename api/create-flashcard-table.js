import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
    try {
        const result = await sql`
            CREATE TABLE IF NOT EXISTS flashcards (
                id VARCHAR(255) PRIMARY KEY,
                term VARCHAR(255) NOT NULL,
                definition VARCHAR(255) NOT NULL,
                set_id VARCHAR(255) REFERENCES sets(id) ON DELETE CASCADE
            );
        `;
        return response.status(200).json({ result });
    } catch (error) {
        return response.status(500).json({ error });
    }
}