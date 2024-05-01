import { sql } from '@vercel/postgres';
 
export default async function handler(request, response) {
    try {
        const result = await sql`
            CREATE TABLE IF NOT EXISTS sets (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                folder_id VARCHAR(255) REFERENCES folders(id) ON DELETE CASCADE
            );
        `;
        return response.status(200).json({ result });
    } catch (error) {
        return response.status(500).json({ error });
    }
}