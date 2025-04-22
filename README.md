# Bedtime Story Generator

A simple web application that generates a short bedtime story with accompanying images and audio narration, presented as a slideshow.

## Features

*   Generates a 5-paragraph story.
*   Generates a unique image for each paragraph.
*   Provides text-to-speech audio narration for each paragraph.
*   Displays the story as an interactive slideshow.

## How to Run

1.  **Clone or download** the repository/files.
2.  **API Keys:** This application requires API keys for external services to generate content:
    *   **OpenAI API Key:** Needed for story generation (using GPT) and image generation (using DALL-E).
        *   Get a key from [https://platform.openai.com/](https://platform.openai.com/).
        *   **Important:** Open `script.js` and replace the placeholder `'YOUR_OPENAI_API_KEY'` with your actual key.
        *   **Security Warning:** Storing API keys directly in client-side JavaScript is insecure for production applications. For personal use or testing, this is acceptable, but be aware of the risks. Consider using a backend server to handle API calls securely in a real-world scenario.
    *   **(Optional) TTS API Key:** If you replace the built-in Web Speech API with a dedicated TTS service (like OpenAI TTS, ElevenLabs, etc.), you will need to add configuration for that service's API key as well.
3.  **Open `index.html`** in your web browser.
4.  Click the "Generate Story" button.
5.  Wait for the story, images, and audio to be generated (this may take a minute).
6.  Use the "Previous" and "Next" buttons to navigate the slideshow.

## Current Status

*   The basic HTML structure, CSS styling, and JavaScript logic are in place.
*   The JavaScript currently uses **placeholder functions** for story and image generation, returning dummy data and images.
*   Text-to-speech uses the browser's built-in **Web Speech API**, which works offline but may have limitations in voice quality and browser support. It reads the text aloud directly when the slide is shown.

## Next Steps

*   Implement actual API calls to OpenAI (GPT and DALL-E) in `script.js` to replace the placeholder functions.
*   (Optional) Implement API calls to a dedicated TTS service for higher-quality audio.
*   Add more robust error handling.
*   (Optional) Allow user input for story themes or characters.
*   (Optional) Implement a backend server for secure API key management.
