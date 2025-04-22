// script.js
document.addEventListener('DOMContentLoaded', () => {
    const storyDisplay = document.getElementById('story-display');
    const storyText = document.getElementById('story-text');
    const storyImage = document.getElementById('story-image');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const generateBtn = document.getElementById('generate-btn'); // Will rename this button's function
    const loadingIndicator = document.getElementById('loading-indicator');
    const slideNumberDisplay = document.getElementById('slide-number'); // Added for slide numbers

    // --- API Endpoints ---
    const API_BASE = '/api'; // Using relative path for Flask backend
    const STORIES_LIST_ENDPOINT = `${API_BASE}/stories`;
    const STORY_DATA_ENDPOINT = (name) => `${API_BASE}/story/${encodeURIComponent(name)}`;

    // --- State ---
    let availableStoryNames = []; // List of story folder names ['story1', 'story2']
    let currentStoryData = null; // Holds the full data for the currently displayed story
    let currentStoryIndex = -1; // Index in availableStoryNames array
    let currentSlideIndex = 0;

    // --- Slideshow Logic ---
    function showSlide(index) {
        if (!currentStoryData || index < 0 || index >= currentStoryData.slides.length) {
            console.error('Invalid slide index or no story data:', index, currentStoryData);
            // Optionally hide elements or show an error message
            storyDisplay.classList.add('hidden'); // Hide if invalid
            return;
        }

        const slide = currentStoryData.slides[index];
        storyText.textContent = slide.paragraph || "(No text for this part)";
        // Image paths from backend are relative to story_assets
        storyImage.src = slide.image ? `/story_assets/${slide.image}` : ''; // Prepend base path
        storyImage.alt = `Illustration for ${currentStoryData.name}, part ${index + 1}`;
        storyImage.onerror = () => {
            console.error(`Error loading image: ${storyImage.src}`);
            storyImage.src = ''; // Clear src on error
            storyImage.alt = 'Image failed to load';
        };

        // Update slide number display
        slideNumberDisplay.textContent = `${index + 1} / ${currentStoryData.slides.length}`;

        // Handle Audio - Placeholder
        // ...

        // Update button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === currentStoryData.slides.length - 1;

        // Update ARIA attributes
        storyDisplay.setAttribute('aria-live', 'polite');
        storyText.setAttribute('aria-label', `Story part ${index + 1}: ${slide.paragraph || 'No text'}`);
        storyDisplay.classList.remove('hidden'); // Ensure display is visible
    }

    function showNextSlide() {
        if (currentStoryData && currentSlideIndex < currentStoryData.slides.length - 1) {
            currentSlideIndex++;
            showSlide(currentSlideIndex);
        }
    }

    function showPrevSlide() {
        if (currentStoryData && currentSlideIndex > 0) {
            currentSlideIndex--;
            showSlide(currentSlideIndex);
        }
    }

    // --- Story Loading and Cycling Logic ---
    async function fetchStoryList() {
        try {
            console.log('Fetching story list...');
            const response = await fetch(STORIES_LIST_ENDPOINT);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            availableStoryNames = await response.json();
            console.log('Available stories:', availableStoryNames);
            if (availableStoryNames.length > 0) {
                // Enable the button if stories are found
                generateBtn.disabled = false;
                generateBtn.textContent = 'Load First Story'; // Initial button text
            } else {
                loadingIndicator.textContent = 'No stories found in story_assets.';
                loadingIndicator.classList.remove('hidden');
                generateBtn.disabled = true;
                generateBtn.textContent = 'No Stories Available';
            }
        } catch (error) {
            console.error('Error fetching story list:', error);
            loadingIndicator.textContent = 'Error loading story list. Is the backend running?';
            loadingIndicator.classList.remove('hidden');
            generateBtn.disabled = true;
        }
    }

    async function loadStory(storyName) {
        if (!storyName) return false;

        console.log(`Fetching story data for: ${storyName}`);
        loadingIndicator.textContent = `Loading '${storyName}'...`;
        loadingIndicator.classList.remove('hidden');
        storyDisplay.classList.add('hidden');
        generateBtn.disabled = true; // Disable while loading

        try {
            const response = await fetch(STORY_DATA_ENDPOINT(storyName));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentStoryData = await response.json();

            if (!currentStoryData || !currentStoryData.slides || currentStoryData.slides.length === 0) {
                throw new Error('Received invalid or empty story data.');
            }

            console.log(`Story '${storyName}' loaded:`, currentStoryData.slides.length, 'slides');

            // Show the first slide
            currentSlideIndex = 0;
            showSlide(currentSlideIndex);

            // Update button text for next action
            generateBtn.textContent = 'Next Story';
            return true; // Indicate success

        } catch (error) {
            console.error(`Error loading story '${storyName}':`, error);
            alert(`Failed to load story '${storyName}': ${error.message}`);
            storyDisplay.classList.add('hidden');
            return false; // Indicate failure
        } finally {
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false; // Re-enable button
        }
    }

    async function handleCycleStoryClick() {
        if (availableStoryNames.length === 0) {
            console.warn('No stories available to cycle.');
            return;
        }

        // Cycle to the next story index
        currentStoryIndex = (currentStoryIndex + 1) % availableStoryNames.length;
        const nextStoryName = availableStoryNames[currentStoryIndex];

        await loadStory(nextStoryName);
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', handleCycleStoryClick); // Changed listener
    prevBtn.addEventListener('click', showPrevSlide);
    nextBtn.addEventListener('click', showNextSlide);

    // --- Initial Setup ---
    storyDisplay.classList.add('hidden');
    loadingIndicator.textContent = 'Loading story list...';
    loadingIndicator.classList.remove('hidden');
    generateBtn.disabled = true; // Disable button until list is fetched
    generateBtn.textContent = 'Loading...'; // Initial button text

    fetchStoryList(); // Fetch the list of stories on page load

    console.log('Bedtime Story Generator script loaded (dynamic mode).');
});
