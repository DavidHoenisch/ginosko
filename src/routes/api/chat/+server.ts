import { json } from '@sveltejs/kit';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import pg from 'pg';
import pgvector from 'pgvector';

export async function POST({ request }: { request: Request }) {
	try {
		const { message } = await request.json();

		if (!message) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		// Initialize OpenAI
		const llm = new ChatOpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY!,
			modelName: 'gpt-4o-mini',
			temperature: 0.7,
		});

		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: process.env.OPENAI_API_KEY!,
			modelName: 'text-embedding-3-small'
		});

		// Initialize database connection
		const client = new pg.Client({
			connectionString: process.env.DATABASE_URL!
		});

		await client.connect();

		// Generate embedding for the query
		const queryEmbedding = await embeddings.embedQuery(message);

		// Search for similar documents using cosine similarity
		const result = await client.query(`
			SELECT content, metadata,
				   1 - (embedding <=> $1::vector) as similarity
			FROM documents
			ORDER BY embedding <=> $1::vector
			LIMIT 3
		`, [pgvector.toSql(queryEmbedding)]);

		const relevantDocs = result.rows;

		// Create context from relevant documents
		const context = relevantDocs.map((doc: any) => doc.content).join('\n\n');

		// Create prompt
		const prompt = `You are a helpful assistant that answers questions about Jane Austen's works. Use the provided context from Jane Austen's novels to answer the user's question. If the context doesn't contain enough information to fully answer the question, say so and provide what information you can find.

Always cite the source of your information by mentioning the work and providing a brief quote when relevant. Be conversational but informative.

Context:
${context}

Question: ${message}

Answer:`;

		// Generate response
		const response = await llm.invoke(prompt);

		await client.end();

		return json({
			response: response.content,
			sources: relevantDocs.map((doc: any) => ({
				content: doc.content.substring(0, 200) + '...',
				metadata: doc.metadata,
				similarity: doc.similarity
			}))
		});

	} catch (error) {
		console.error('Error processing chat request:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}