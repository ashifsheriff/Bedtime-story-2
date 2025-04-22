# generate_story.py
import os
import re
from openai import OpenAI, OpenAIError

# --- Configuration ---
STORY_ASSETS_DIR = "story_assets"
STORY_PROMPT = (
    "Write a short, happy, and imaginative bedtime story suitable for a young child (around 3-6 years old). "
    "The story should be about 5-7 paragraphs long. "
    "Start the story with a clear title line like 'Title: The Magical Starfish'. "
    "The story should have a gentle and calming tone, ending on a positive note encouraging sleep."
)
STORY_FILE_NAME = "story.txt"
GPT_MODEL = "gpt-3.5-turbo" # Or use "gpt-4" if preferred/available

# --- Helper Functions ---

def sanitize_filename(name):
    """Removes invalid characters and replaces spaces for use as a folder name."""
    # Remove characters that are not alphanumeric, underscore, or hyphen
    name = re.sub(r'[^\w\-]+', '_', name)
    # Replace multiple underscores with a single one
    name = re.sub(r'_+', '_', name)
    # Remove leading/trailing underscores
    name = name.strip('_')
    # Convert to lowercase
    name = name.lower()
    # Limit length to avoid issues (optional)
    name = name[:50]
    if not name: # Handle empty strings after sanitization
        return "untitled_story"
    return name

def extract_title(story_text):
    """Attempts to extract a title from the first line if it starts with 'Title:'."""
    lines = story_text.strip().split('\n')
    if lines and lines[0].lower().startswith("title:"):
        # Return the part after "Title:"
        return lines[0][len("title:"):].strip()
    # Fallback: Use first few words if no title line found
    first_sentence = lines[0] if lines else "Untitled Story"
    words = first_sentence.split()
    fallback_title = "_".join(words[:5]) # Use first 5 words
    return fallback_title if fallback_title else "Untitled Story"

def generate_story():
    """Generates a story using the OpenAI API."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Please set it before running the script:")
        print("export OPENAI_API_KEY='your_key_here'")
        return None

    try:
        client = OpenAI(api_key=api_key)
        print(f"Generating story using model: {GPT_MODEL}...")
        completion = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[
                {"role": "system", "content": "You are a creative storyteller specializing in children's bedtime stories."},
                {"role": "user", "content": STORY_PROMPT}
            ],
            temperature=0.7, # Adjust for creativity vs consistency
            max_tokens=600  # Adjust based on desired length
        )
        story_content = completion.choices[0].message.content
        print("Story generated successfully.")
        return story_content.strip()

    except OpenAIError as e:
        print(f"Error communicating with OpenAI API: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- Main Execution ---
if __name__ == "__main__":
    print("Starting Bedtime Story Generator script...")

    # 1. Generate the story content
    story_text = generate_story()

    if not story_text:
        print("Story generation failed. Exiting.")
        exit(1)

    # 2. Extract title and create folder name
    title = extract_title(story_text)
    folder_name = sanitize_filename(title)
    print(f"Extracted Title: '{title}'")
    print(f"Sanitized Folder Name: '{folder_name}'")

    # 3. Create the directory structure
    base_path = os.path.dirname(os.path.abspath(__file__)) # Get script's directory
    story_assets_path = os.path.join(base_path, STORY_ASSETS_DIR)
    new_story_folder_path = os.path.join(story_assets_path, folder_name)

    try:
        os.makedirs(new_story_folder_path, exist_ok=True)
        print(f"Ensured directory exists: '{new_story_folder_path}'")
    except OSError as e:
        print(f"Error creating directory '{new_story_folder_path}': {e}")
        exit(1)

    # 4. Save the story to a file
    file_path = os.path.join(new_story_folder_path, STORY_FILE_NAME)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(story_text)
        print(f"Story successfully saved to: '{file_path}'")
        print("\nScript finished.")
    except IOError as e:
        print(f"Error writing story to file '{file_path}': {e}")
        exit(1)
