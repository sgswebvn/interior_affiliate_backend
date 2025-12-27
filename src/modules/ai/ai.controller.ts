
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../config/prisma';

// Initialize Gemini
// Use gemini-1.5-flash as the standard free/fast model.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("⚠️ Checking AI: GEMINI_API_KEY is missing in .env");
}
const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key'); // Prevent crash on init, fail on call
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateSeoContent(req: Request, res: Response) {
    try {
        console.log("🤖 [AI] Generating SEO Content for:", req.body.title);
        const { title, topicName } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const prompt = `
            You are an expert SEO Content Writer for an Interior Design and Furniture Review website.
            Write a high-quality, SEO-optimized article in Vietnamese based on the title "${title}" and topic "${topicName || 'General'}".
            
            Requirements:
            1.  **Structure**: logic structure with <h2>, <h3>, <ul>, <p>.
            2.  **Style**: Professional, objective but engaging. "Review Cực Chất" style (Trusted, detailed).
            3.  **Length**: At least 600 words.
            4.  **Format**: Return ONLY the HTML body content (without <html>, <head>, <body> tags). Just the inner content starting with <p> or <h2>.
            5.  **Highlights**: Highlight key features using <strong>.
            6.  **Tone**: Encourage users to check trusted links (affiliate) but don't fake links.

            Start writing now.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });
    } catch (error) {
        console.error('AI Gen Error:', error);
        res.status(500).json({ message: 'Failed to generate content' });
    }
}

export async function chatWithSite(req: Request, res: Response) {
    try {
        const { message } = req.body;

        // Simple RAG (Retrieval Augmented Generation) simulation
        // 1. Search for relevant posts (naive search by keywords in message)
        const relevantPosts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: message, mode: 'insensitive' } },
                    { content: { contains: message, mode: 'insensitive' } },
                    { topic: { name: { contains: message, mode: 'insensitive' } } }
                ],
                publishedAt: { not: null }
            },
            take: 3,
            select: { title: true, excerpt: true, slug: true }
        });

        // 2. Construct Context
        const contextDocs = relevantPosts.map(p => `- Article: "${p.title}" (${p.excerpt}) Link: /posts/${p.slug}`).join('\n');

        const prompt = `
            You are the AI Assistant of "Review Cực Chất" website.
            User Question: "${message}"

            Context from our website:
            ${contextDocs || "No specific articles found matching this query."}

            Instruction:
            - Answer the user's question in Vietnamese.
            - If we have relevant articles in Context, cite them and recommend reading more.
            - If no articles found, answer generally about interior design/furniture based on your knowledge, but be polite.
            - Keep it short (under 150 words) and helpful.
            - Tone: Friendly, expert.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error: any) {
        console.error("❌ [AI Chat Error]:", error);
        // More specific error for debugging
        const errorMessage = error.response ? JSON.stringify(error.response) : error.message;
        res.status(500).json({
            error: "Failed to chat",
            details: errorMessage,
            tip: "Check API Key and Model Name"
        });
    }
}

