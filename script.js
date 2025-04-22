// script.js
document.addEventListener('DOMContentLoaded', () => {
    const storyDisplay = document.getElementById('story-display');
    const storyText = document.getElementById('story-text');
    const storyImage = document.getElementById('story-image');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const generateBtn = document.getElementById('generate-btn');
    const loadingIndicator = document.getElementById('loading-indicator');

    // --- Configuration ---
    const STORY_ASSET_PATH = 'story_assets/sleepy_stars_journey/';

    // --- Predefined Story Content ---
    const PREDEFINED_STORY = [
        {
            paragraph: "Once upon a time, in a quiet corner of the night sky, lived a tiny star named Luma. Luma wasn’t the brightest or the fastest, but she had the kindest glow. Every night, she twinkled softly, hoping someone would notice her gentle light.",
            image: `${STORY_ASSET_PATH}image1.png`,
            audio: null // Audio skipped for now
        },
        {
            paragraph: "One evening, Luma looked down at Earth and saw a little girl named Tara trying to fall asleep. Tara tossed and turned in her bed, her mind buzzing with thoughts of the day. Seeing her struggle, Luma decided she would help. With a shimmer and a giggle, Luma drifted closer to Earth. As she got near, the night air filled with a gentle hum — a lullaby only hearts could hear. Tara opened her eyes and saw the glowing star outside her window. Her eyes widened with wonder.",
            image: `${STORY_ASSET_PATH}image2.png`,
            audio: null
        },
        {
            paragraph: "Luma whispered, “Close your eyes, little dreamer, and let’s go on a journey.” Tara, comforted by the glow, nodded and shut her eyes. In a flash, she found herself floating beside Luma in the sky, soaring past clouds, over mountains, and through silver streams of moonlight.",
            image: `${STORY_ASSET_PATH}image3.png`,
            audio: null
        },
        {
            paragraph: "They visited sleepy owls perched on trees, swam with stardust dolphins in the Milky Way, and danced with glowing fireflies who lit up the sky like fairy lanterns. Tara laughed and felt lighter than air. The worries of the day melted away like morning mist.",
            image: `${STORY_ASSET_PATH}image4.png`,
            audio: null
        },
        {
            paragraph: "As the adventure wound down, Luma brought Tara back to her room, her heart now calm and full. “Whenever you can’t sleep,” Luma whispered, “just look for my glow. I’ll be right here.” Tara smiled and drifted into the deepest, sweetest sleep she’d ever known. And from then on, Luma twinkled a little brighter — not because she was the biggest star, but because she had given someone a dream.",
            image: `${STORY_ASSET_PATH}image5.png`,
            audio: null
        }
    ];

    // --- State ---
    let currentStory = []; // Array of { paragraph: string, image: string (URL), audio: string (URL/data) }
    let currentSlideIndex = 0;

    // --- Slideshow Logic ---
    function showSlide(index) {
        if (index < 0 || index >= currentStory.length) {
            console.error('Invalid slide index:', index);
            return;
        }
        const slide = currentStory[index];
        storyText.textContent = slide.paragraph;
        storyImage.src = slide.image || ''; // Use empty string if no image
        storyImage.alt = `Illustration for story part ${index + 1}`;
        storyImage.onerror = () => {
            console.error(`Error loading image: ${slide.image}`);
            storyImage.src = ''; // Maybe hide image on error or show text placeholder?
            storyImage.alt = 'Image failed to load';
        };

        // Handle Audio - Placeholder for future
        // if (slide.audio) {
        //     // Logic to play audio based on type (URL, data, WebSpeech text)
        //     console.log('Playing audio for slide', index + 1);
        // }

        // Update button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === currentStory.length - 1;

        // Update ARIA attributes for accessibility
        storyDisplay.setAttribute('aria-live', 'polite');
        storyText.setAttribute('aria-label', `Story part ${index + 1}: ${slide.paragraph}`);
    }

    function showNextSlide() {
        if (currentSlideIndex < currentStory.length - 1) {
            currentSlideIndex++;
            showSlide(currentSlideIndex);
        }
    }

    function showPrevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            showSlide(currentSlideIndex);
        }
    }

    // --- Story Generation Logic (Simplified) ---
    async function handleGenerateClick() {
        console.log('Loading predefined story...');
        generateBtn.disabled = true;
        loadingIndicator.textContent = 'Loading story...';
        loadingIndicator.classList.remove('hidden');
        storyDisplay.classList.add('hidden');
        // window.speechSynthesis.cancel(); // Stop any ongoing speech (if implemented later)

        try {
            // Directly use the predefined story
            currentStory = PREDEFINED_STORY;

            if (!currentStory || currentStory.length === 0) {
                throw new Error('Predefined story is empty.');
            }

            console.log('Predefined story loaded:', currentStory.length, 'parts');

            // Show the first slide
            currentSlideIndex = 0;
            showSlide(currentSlideIndex);

            // Show the story display
            storyDisplay.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading predefined story:', error);
            alert(`Failed to load the story: ${error.message}`);
            // Optionally hide story display or show an error message
            storyDisplay.classList.add('hidden');
        } finally {
            // Hide loading indicator and re-enable button
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
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

    console.log('Bedtime Story Generator script loaded (static mode).');
});
