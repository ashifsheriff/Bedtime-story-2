// netlify/functions/generate-story.js
const fetch = require('node-fetch'); // Need to install node-fetch if not using built-in fetch

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { prompt, storyLength } = JSON.parse(event.body);
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Access key from environment variable

    if (!OPENAI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI API Key not configured on server.' }) };
    }
    if (!prompt) {
         return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt in request body.' }) };
    }
    if (!storyLength) {
         return { statusCode: 400, body: JSON.stringify({ error: 'Missing storyLength in request body.' }) };
    }


    const OPENAI_API_URL_COMPLETIONS = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(OPENAI_API_URL_COMPLETIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: `You are a creative storyteller. Generate a happy, simple bedtime story suitable for young children. The story should ideally be around ${storyLength} paragraphs long. Respond *only* with the story text.` },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            // Return the actual error message from OpenAI if available
            return { statusCode: response.status, body: JSON.stringify({ error: `OpenAI API request failed: ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}` }) };
        }

        const data = await response.json();
        const storyText = data.choices[0]?.message?.content?.trim();

        if (!storyText) {
            return { statusCode: 500, body: JSON.stringify({ error: 'No story content received from OpenAI.' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyText: storyText })
        };

    } catch (error) {
        console.error('Error calling OpenAI Completions API:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error: Failed to generate story.' }) };
    }
};
