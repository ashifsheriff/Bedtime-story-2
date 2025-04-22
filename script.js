const generateBtn = document.getElementById('generate-btn');
const storyDisplay = document.getElementById('story-display');
const slideContainer = document.getElementById('slide-container');
const storyImage = document.getElementById('story-image');
const storyParagraph = document.getElementById('story-paragraph');
const storyAudio = document.getElementById('story-audio');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const slideNumber = document.getElementById('slide-number');
const loadingIndicator = document.getElementById('loading-indicator');

// --- Configuration ---
// API Key is REMOVED from here and will be handled by backend functions
const STORY_LENGTH = 5; // Number of paragraphs/slides

// URLs for our backend Netlify functions
const API_URL_STORY = '/.netlify/functions/generate-story';
const API_URL_IMAGE = '/.netlify/functions/generate-image';
const API_URL_AUDIO = '/.netlify/functions/generate-audio';

// --- State ---
let currentStory = []; // Array of { paragraph: string, image: string (URL), audio: string (URL/data) }
let currentSlideIndex = 0;
let isLoading = false;

// --- Helper Function ---

/**
 * Splits a string into a specified number of roughly equal parts.
 * Tries to split at whitespace boundaries near the target length.
 * @param {string} text The text to split.
 * @param {number} numParts The desired number of parts.
 * @returns {string[]} An array of strings, always of length numParts.
 */
function splitStoryIntoParts(text, numParts) {
    if (!text || numParts < 1) {
        return Array(numParts).fill(''); // Return empty strings if no text or invalid parts
    }

    const totalLength = text.length;
    const targetLength = Math.max(1, Math.floor(totalLength / numParts)); // Ensure target length is at least 1
    const parts = [];
    let startIndex = 0;

    for (let i = 0; i < numParts; i++) {
        if (startIndex >= totalLength) {
            parts.push(''); // Add empty string if we've run out of text
            continue;
        }

        // For the last part, take the rest of the string
        if (i === numParts - 1) {
            parts.push(text.substring(startIndex).trim());
            break;
        }

        // Calculate the ideal end index for this part
        let endIndex = Math.min(startIndex + targetLength, totalLength);

        // Try to find the nearest space *before* the ideal end index
        // Look back up to half the target length for a space
        let splitIndex = -1;
        const searchLimit = Math.max(startIndex, endIndex - Math.floor(targetLength / 2));
        for (let j = endIndex; j >= searchLimit; j--) {
             if (/\s/.test(text[j])) {
                 splitIndex = j;
                 break;
             }
        }

        // If no suitable space found nearby, just split at the target length
        // or force split if close to end
         if (splitIndex <= startIndex) {
             // If we couldn't find a space, or the space is at the start,
             // search forward for the *next* space to avoid tiny parts,
             // unless we are very close to the end of the text
             let nextSpace = text.indexOf(' ', endIndex);
             if (nextSpace !== -1 && nextSpace < startIndex + targetLength * 1.5) {
                 splitIndex = nextSpace;
             } else {
                  // Force split at target length or end of string
                 splitIndex = endIndex;
             }
         }


        parts.push(text.substring(startIndex, splitIndex).trim());
        startIndex = splitIndex; // Start next part after the split point

        // Skip potential whitespace at the beginning of the next part
         while (startIndex < totalLength && /\s/.test(text[startIndex])) {
             startIndex++;
         }
    }

     // If we somehow generated more parts than needed (shouldn't happen with this logic)
     while(parts.length > numParts) parts.pop();
     // If we generated fewer parts (e.g., very short text), pad with empty strings
     while(parts.length < numParts) parts.push('');

    console.log("Split text into parts:", parts);
    // Return the array, potentially with empty strings to ensure length is numParts
    // Filter out empty parts before returning?
    // Let's return the full array and filter in the caller
    return parts;
}

// --- API Functions ---

async function generateStoryContent(prompt) {
    console.log('Generating story content via backend function...');
    // No API Key needed here anymore

    try {
        // Call our backend function
        const response = await fetch(API_URL_STORY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                storyLength: STORY_LENGTH // Pass required length to backend
             })
        });

        const data = await response.json(); // Always try to parse JSON

        if (!response.ok) {
            console.error('Backend Story Function Error:', data);
            // Use the error message from the backend function's response body
            throw new Error(data.error || `Backend story function request failed: ${response.status} ${response.statusText}`);
        }


        console.log('Backend Story Response:', data);

        const storyText = data.storyText; // Get text from backend response
        if (!storyText) {
            throw new Error('No story content received from backend.');
        }

        console.log('Raw story text received successfully from backend.');
        return storyText; // Return the raw text

    } catch (error) {
        console.error('Error calling Story backend function:', error);
        throw error; // Re-throw the error
    }
}

async function generateImage(paragraphText) {
     // Basic check on frontend side
     if (!paragraphText || paragraphText.trim().length === 0) {
         console.warn("Skipping image generation request for empty paragraph.");
         return 'placeholder.png'; // Return placeholder directly
     }

    console.log('Requesting image generation via backend function for text:', paragraphText.substring(0, 50) + "...");
    // No API Key needed here

    try {
        // Call our backend function
        const response = await fetch(API_URL_IMAGE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paragraphText: paragraphText })
        });

        const data = await response.json(); // Always try to parse JSON

        if (!response.ok) {
            console.error('Backend Image Function Error:', data);
             // Use error from backend response if available, otherwise use status
             throw new Error(data.error || `Backend image function request failed: ${response.status} ${response.statusText}`);
             // Or just return placeholder? Let's throw for now to make errors visible.
             // console.warn('Backend image function failed, using placeholder.');
             // return 'placeholder.png';
        }

        const imageUrl = data.imageUrl; // Get URL from backend response

        if (!imageUrl) {
             console.warn('No image URL received from backend, using placeholder.');
             return 'placeholder.png';
        }

        console.log('Image URL received successfully from backend:', imageUrl);
        return imageUrl;

    } catch (error) {
        console.error('Error calling Image backend function:', error);
         // Return placeholder on frontend error too
         console.warn('Frontend error calling image function, using placeholder.');
         return 'placeholder.png';
    }
}

async function generateAudio(paragraphText) {
    // Skip if text is empty
     if (!paragraphText || paragraphText.trim().length === 0) {
         console.warn("Skipping audio generation request for empty paragraph.");
         return null;
     }

    console.log('Requesting audio generation via backend function...');
    // No API Key needed here

    try {
        // Call our (currently placeholder) backend function
        const response = await fetch(API_URL_AUDIO, {
            method: 'POST', // Even though not implemented, keep method consistent
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paragraphText: paragraphText }) // Send text anyway
        });

         const data = await response.json(); // Try parsing JSON

        if (!response.ok) {
            // Log error but don't block the story
            console.error('Backend Audio Function Error:', data);
             throw new Error(data.error || `Backend audio function request failed: ${response.status}`);
        }

        // Expecting { audioData: null } or similar from our placeholder function
        const audioData = data.audioData;
        if (!audioData) {
             console.log('No audio data received from backend (as expected for now).');
             return null; // Return null since audio is not implemented
        }

        // --- IF/WHEN AUDIO IS IMPLEMENTED ON BACKEND: ---
        // The backend would return audio data (e.g., base64 string or URL)
        // console.log('Audio data received successfully from backend.');
        // return audioData; // Return the actual audio data/URL
        // --- END IF/WHEN ---

         return null; // Explicitly return null for now

    } catch (error) {
        // Log error but don't block the story
        console.error('Error calling Audio backend function:', error);
        return null; // Return null on error
    }
}

// --- Slideshow Logic ---

function updateSlide() {
    if (currentStory.length === 0 || currentSlideIndex < 0 || currentSlideIndex >= currentStory.length) {
        return;
    }

    const slideData = currentStory[currentSlideIndex];

    storyParagraph.textContent = slideData.paragraph;
    storyImage.src = slideData.image || '#'; // Use placeholder if image missing
    storyImage.alt = `Image for paragraph ${currentSlideIndex + 1}`;
    
    // Handle Audio
    storyAudio.pause();
    storyAudio.currentTime = 0;
    storyAudio.src = ''; // Clear previous source

    if (slideData.audio) {
        if (slideData.audio.type === 'webspeech') {
            // For Web Speech API, we speak directly rather than loading a source
            storyAudio.classList.add('hidden'); // Hide audio player if using Web Speech
            speakText(slideData.audio.text);
        } else if (slideData.audio.type === 'url') {
            storyAudio.src = slideData.audio.data;
            storyAudio.classList.remove('hidden');
            storyAudio.load(); // Preload audio
            // storyAudio.play(); // Optional: Auto-play
        }
    } else {
        storyAudio.classList.add('hidden'); // Hide if no audio
    }
    
    slideNumber.textContent = `${currentSlideIndex + 1} / ${currentStory.length}`;

    // Update button states
    prevBtn.disabled = currentSlideIndex === 0;
    nextBtn.disabled = currentSlideIndex === currentStory.length - 1;
}

function speakText(text) {
     if ('speechSynthesis' in window) {
         window.speechSynthesis.cancel(); // Cancel any previous speech
         const utterance = new SpeechSynthesisUtterance(text);
         utterance.lang = 'en-US';
         window.speechSynthesis.speak(utterance);
     } else {
         console.warn('Cannot speak text: Web Speech API not supported.');
     }
}

function showNextSlide() {
    if (currentSlideIndex < currentStory.length - 1) {
        currentSlideIndex++;
        updateSlide();
    }
}

function showPrevSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlide();
    }
}

// --- Main Generation Function ---

async function handleGenerateClick() {
    if (isLoading) return; // Prevent multiple simultaneous generations

    isLoading = true;
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    storyDisplay.classList.add('hidden');
    loadingIndicator.textContent = 'Generating story text...'; // Initial message
    loadingIndicator.classList.remove('hidden');
    currentStory = [];
    currentSlideIndex = 0;
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    try {
        // 1. Generate Raw Story Text
        const storyPrompt = "Write a short, happy bedtime story suitable for a young child."; // Simpler prompt now
        console.log("Generating raw story text...");
        const rawStoryText = await generateStoryContent(storyPrompt);

        // 2. Split text into paragraphs
        loadingIndicator.textContent = 'Structuring story...';
        console.log("Splitting story into paragraphs...");
        const paragraphs = splitStoryIntoParts(rawStoryText, STORY_LENGTH);

        // We now expect exactly STORY_LENGTH parts, potentially including empty ones.
         console.log(`Story split into ${paragraphs.length} parts.`);
         // Filter out empty paragraphs *before* generating assets
         const nonEmptyParagraphs = paragraphs.filter(p => p && p.trim().length > 0);
         if(nonEmptyParagraphs.length === 0) {
             throw new Error("Generated story was empty after splitting.");
         }

        // 3. Generate Image and Audio for each NON-EMPTY paragraph
        loadingIndicator.textContent = 'Generating images and audio...';
        currentStory = []; // Reset story array
        for (let i = 0; i < nonEmptyParagraphs.length; i++) {
            const paragraph = nonEmptyParagraphs[i];
            console.log(`Processing paragraph ${i + 1}/${nonEmptyParagraphs.length}...`);
            // Update loading indicator more accurately
            const progressPercentage = Math.round(((i + 1) / nonEmptyParagraphs.length) * 100);
            // loadingIndicator.textContent = `Generating assets for paragraph ${i + 1}/${STORY_LENGTH} (${progressPercentage}%)...`;
            loadingIndicator.textContent = `Generating assets (${progressPercentage}%)...`;

            // Generate image and audio in parallel for speed
            const [imageUrl, audioData] = await Promise.all([
                generateImage(paragraph), // Generate image
                generateAudio(paragraph)  // Generate audio // Assuming generateAudio also handles empty strings gracefully
            ]);

            currentStory.push({ paragraph: paragraph, image: imageUrl, audio: audioData });
        }

         if (currentStory.length === 0) {
             throw new Error("No valid story parts could be generated.");
         }

        // 4. Display the first slide
        loadingIndicator.classList.add('hidden');
        storyDisplay.classList.remove('hidden');
        currentSlideIndex = 0;
        updateSlide(); // updateSlide should now use currentStory which has variable length

    } catch (error) {
        console.error('Error generating story:', error);
        // Ensure loading indicator shows the final error
        loadingIndicator.textContent = `Error: ${error.message}`;
        // alert('Failed to generate story. Please check console for details. Error: ' + error.message); // Already done by textContent
        storyDisplay.classList.add('hidden');
        // Do not hide loading indicator if there was an error, keep showing the error message
        loadingIndicator.classList.remove('hidden');

    } finally {
        isLoading = false;
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Story';
        // Ensure loading indicator is hidden ONLY on success
        if (!storyDisplay.classList.contains('hidden')) {
             loadingIndicator.classList.add('hidden');
             loadingIndicator.textContent = ''; // Clear text on success
        }
    }
}

// --- Event Listeners ---
generateBtn.addEventListener('click', handleGenerateClick);
prevBtn.addEventListener('click', showPrevSlide);
nextBtn.addEventListener('click', showNextSlide);

// --- Initial Setup ---
// Hide story display initially
storyDisplay.classList.add('hidden');
loadingIndicator.classList.add('hidden');

console.log('Bedtime Story Generator script loaded.');
