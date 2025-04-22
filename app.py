# app.py
import os
import math
from flask import Flask, jsonify, send_from_directory

app = Flask(__name__, static_folder='story_assets')

STORY_ASSETS_DIR = "story_assets"
STORY_FILE_NAME = "story.txt"
NUM_IMAGES_PER_STORY = 5
IMAGE_EXTENSION = ".png"


def split_story(text, num_parts):
    """Splits the text into roughly equal parts (similar to image_generator)."""
    # Basic split by paragraphs first, if possible
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if len(paragraphs) >= num_parts:
        # Try to group paragraphs roughly evenly
        parts = []
        group_size = math.ceil(len(paragraphs) / num_parts)
        for i in range(0, len(paragraphs), group_size):
            parts.append("\n\n".join(paragraphs[i:i + group_size]))
        # Ensure exactly num_parts
        while len(parts) < num_parts:
            parts.append("") # Add empty string if needed
        # If grouping resulted in too many parts, merge the last ones
        while len(parts) > num_parts:
            last_part = parts.pop()
            parts[-1] += "\n\n" + last_part
        return parts[:num_parts]
    else:
        # Fallback to character-based split if not enough paragraphs
        total_length = len(text)
        part_length = math.ceil(total_length / num_parts)
        parts = []
        for i in range(num_parts):
            start = i * part_length
            end = min((i + 1) * part_length, total_length)
            parts.append(text[start:end].strip())
        while len(parts) < num_parts:
            parts.append("")
        return parts[:num_parts]


def get_valid_stories():
    """Scans the story assets directory for valid story folders."""
    valid_stories = []
    if not os.path.isdir(STORY_ASSETS_DIR):
        return []

    for item_name in sorted(os.listdir(STORY_ASSETS_DIR)): # Sort for consistent order
        story_folder_path = os.path.join(STORY_ASSETS_DIR, item_name)
        if os.path.isdir(story_folder_path):
            story_file_path = os.path.join(story_folder_path, STORY_FILE_NAME)
            if os.path.isfile(story_file_path):
                # Check for 5 images
                image_count = 0
                for i in range(1, NUM_IMAGES_PER_STORY + 1):
                    img_file = f"image_{i}{IMAGE_EXTENSION}"
                    if os.path.isfile(os.path.join(story_folder_path, img_file)):
                        image_count += 1
                if image_count >= NUM_IMAGES_PER_STORY:
                    valid_stories.append(item_name)
    return valid_stories

@app.route('/api/stories')
def list_stories():
    """API endpoint to get a list of available story folder names."""
    stories = get_valid_stories()
    return jsonify(stories)

@app.route('/api/story/<story_name>')
def get_story_data(story_name):
    """API endpoint to get the content of a specific story."""
    stories = get_valid_stories() # Re-validate to prevent direct access to invalid folders
    if story_name not in stories:
        return jsonify({"error": "Story not found or invalid"}), 404

    story_folder_path = os.path.join(STORY_ASSETS_DIR, story_name)
    story_file_path = os.path.join(story_folder_path, STORY_FILE_NAME)

    try:
        with open(story_file_path, 'r', encoding='utf-8') as f:
            story_text = f.read()
    except IOError:
        return jsonify({"error": "Could not read story file"}), 500

    story_parts = split_story(story_text, NUM_IMAGES_PER_STORY)
    image_paths = []
    for i in range(1, NUM_IMAGES_PER_STORY + 1):
        # Use relative paths that the browser can access via Flask static serving
        relative_img_path = os.path.join(story_name, f"image_{i}{IMAGE_EXTENSION}").replace('\\', '/')
        image_paths.append(relative_img_path)

    story_data = {
        "name": story_name,
        "slides": [
            {"paragraph": part, "image": img_path, "audio": None}
            for part, img_path in zip(story_parts, image_paths)
        ]
    }
    return jsonify(story_data)

# Serve static files (images) from the story_assets directory
# This is needed so the browser can load story_assets/story_name/image_X.png
@app.route('/story_assets/<path:filename>')
def serve_story_asset(filename):
    return send_from_directory(STORY_ASSETS_DIR, filename)

# Basic route for the main page
@app.route('/')
def index():
    # Serve index.html from the root directory
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Serve other static files like script.js, style.css from the root
    return send_from_directory('.', filename)

if __name__ == '__main__':
    # Use host='0.0.0.0' to make it accessible on the network if needed
    # debug=True automatically restarts the server on code changes
    app.run(debug=True, port=5000) # Using port 5000
