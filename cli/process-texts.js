import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import fs from 'fs';
import pg from 'pg';
import pgvector from 'pgvector';
import dotenv from 'dotenv';

dotenv.config();

// Load and clean Jane Austen works from file
  const rawText = fs.readFileSync('../pg31100.txt', 'utf-8');
const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK';
const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK';
const startIndex = rawText.indexOf(startMarker);
const endIndex = rawText.indexOf(endMarker);
const cleanText = rawText.substring(startIndex, endIndex + endMarker.length);

const rawDocs = [new Document({ pageContent: cleanText, metadata: { source: 'pg31100.txt', author: 'Jane Austen' } })];

export async function processJaneAustenWorks() {
  // Initialize embeddings
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small'
  });

  // Initialize database connection
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  // Initialize pgvector
  await client.query('CREATE EXTENSION IF NOT EXISTS vector');
  await client.query('CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, content TEXT, metadata JSONB, embedding VECTOR(1536))');

  // Load and clean Jane Austen works from file
  const rawText = fs.readFileSync('../pg31100.txt', 'utf-8');
  const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK';
  const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK';
  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);
  const cleanText = rawText.substring(startIndex, endIndex + endMarker.length);

  // Split into individual works
  const works = [
    { title: 'Persuasion', start: 'PERSUASION' },
    { title: 'Northanger Abbey', start: 'NORTHANGER ABBEY' },
    { title: 'Mansfield Park', start: 'MANSFIELD PARK' },
    { title: 'Emma', start: 'EMMA' },
    { title: 'Lady Susan', start: 'LADY SUSAN' },
    { title: 'Love and Friendship', start: 'LOVE AND FREINDSHIP' },
    { title: 'Pride and Prejudice', start: 'PRIDE AND PREJUDICE' },
    { title: 'Sense and Sensibility', start: 'SENSE AND SENSIBILITY' }
  ];

  const rawDocs = [];
  let lastEnd = 0;
  for (let i = 0; i < works.length; i++) {
    const work = works[i];
    const startPos = cleanText.indexOf(work.start, lastEnd);
    const endPos = i < works.length - 1 ? cleanText.indexOf(works[i+1].start, startPos) : cleanText.length;
    if (startPos !== -1) {
      const content = cleanText.substring(startPos, endPos).trim();
      rawDocs.push(new Document({ pageContent: content, metadata: { title: work.title, author: 'Jane Austen', source: 'pg31100.txt' } }));
      lastEnd = endPos;
    }
  }

  console.log(`Loaded and split into ${rawDocs.length} works`);

  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);

  console.log(`Split into ${docs.length} chunks`);

  // Add documents to vector store in batches
  const batchSize = 50;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(docs.length / batchSize)}`);
    for (const doc of batch) {
      try {
        const embedding = await embeddings.embedQuery(doc.pageContent);
        await client.query(
          'INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3)',
          [doc.pageContent, doc.metadata, pgvector.toSql(embedding)]
        );
      } catch (error) {
        console.error('Error processing chunk:', error.message);
      }
    }
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await client.end();
  console.log('All works processed successfully!');
}