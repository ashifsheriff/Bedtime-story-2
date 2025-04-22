// netlify/functions/generate-image.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { paragraphText } = JSON.parse(event.body);
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI API Key not configured on server.' }) };
    }
     if (!paragraphText) {
         // Return placeholder if no text provided
         return { statusCode: 200, body: JSON.stringify({ imageUrl: 'placeholder.png' }) };
     }

    const OPENAI_API_URL_IMAGES = 'https://api.openai.com/v1/images/generations';
    const MAX_PROMPT_LENGTH = 900;
    let imagePrompt = paragraphText;

     if (imagePrompt.length > MAX_PROMPT_LENGTH) {
         imagePrompt = imagePrompt.substring(0, MAX_PROMPT_LENGTH);
     }
     imagePrompt = `Children's book illustration style: ${imagePrompt}`;

    try {
        const response = await fetch(OPENAI_API_URL_IMAGES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-2",
                prompt: imagePrompt,
                n: 1,
                size: '512x512'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI Image API Error:', errorData);
            // Return placeholder on error
            return { statusCode: 200, body: JSON.stringify({ imageUrl: 'placeholder.png' }) }; // Return 200 with placeholder
             // Or return the error: return { statusCode: response.status, body: JSON.stringify({ error: `OpenAI Image API request failed: ${errorData?.error?.message || 'Unknown error'}` }) };
        }

        const data = await response.json();
        const imageUrl = data.data[0]?.url;

        if (!imageUrl) {
             // Return placeholder if no URL received
             return { statusCode: 200, body: JSON.stringify({ imageUrl: 'placeholder.png' }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: imageUrl })
        };

    } catch (error) {
        console.error('Error calling OpenAI Images API:', error);
         // Return placeholder on internal error
         return { statusCode: 200, body: JSON.stringify({ imageUrl: 'placeholder.png' }) };
         // Or return the error: return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error: Failed to generate image.' }) };
    }
};
