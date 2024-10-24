from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import zipfile
from pathlib import Path
import shutil
import re
import subprocess
import webview  # Import pywebview

app = Flask(__name__)

# Configuration for file uploads
UPLOAD_FOLDER = '/tmp/uploads'
CONTENT_DIR = '../src/content/blog'
IMAGES_DIR = '../public/images/blog'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    # Serve the HTML file for the upload page
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    blog_name = request.form.get('blog_name')
    title = request.form.get('title')
    description = request.form.get('description')
    icon = request.form.get('icon')

    # If no blog name is provided, default to the filename (without extension)
    if not blog_name:
        blog_name = Path(file.filename).stem

    # Sanitize the blog name to create a directory-friendly format
    blog_name_slug = re.sub(r'\W+', '-', blog_name.lower())

    # Save the uploaded file
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Process the zip file
    process_zip(file_path, blog_name_slug, title, description, icon)

    return jsonify({'success': True, 'message': f'Blog post "{blog_name}" processed successfully'})

def process_zip(zip_file_path: str, blog_name_slug: str, title: str, description: str, icon: str):
    # Define directories
    content_path = Path(CONTENT_DIR)
    images_path = Path(IMAGES_DIR) / blog_name_slug

    # Create the unique images directory for the blog post
    images_path.mkdir(parents=True, exist_ok=True)

    # Unzip the file
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall('/tmp')

    # Find extracted markdown and images
    tmp_dir = Path('/tmp')
    markdown_file = None
    image_files = []

    # Loop through the extracted files and classify them
    for root, dirs, files in os.walk(tmp_dir):
        for file in files:
            file_path = Path(root) / file
            if file.endswith('.md'):
                markdown_file = file_path
            else:
                # Only append the file if it is a regular file and not a zip file
                if file_path.is_file() and file_path.suffix not in ['.zip', '.md']:
                    image_files.append(file_path)

    # Move markdown file to content directory and insert frontmatter
    if markdown_file:
        new_markdown_path = content_path / f"{blog_name_slug}.md"
        shutil.move(str(markdown_file), new_markdown_path)
        insert_frontmatter(new_markdown_path, title, description, icon)

    # Move image files to the unique images directory
    for image in image_files:
        shutil.move(str(image), images_path / image.name)

    # Update the markdown file's image paths
    if markdown_file:
        update_image_paths(new_markdown_path, images_path)

def insert_frontmatter(markdown_file: Path, title: str, description: str, icon: str):
    # Define the frontmatter block
    frontmatter = f"""---
title: {title}
description: {description}
icon: {icon}
---

"""

    # Prepend the frontmatter to the markdown file
    with open(markdown_file, 'r+') as file:
        content = file.read()
        file.seek(0)
        file.write(frontmatter + content)

def update_image_paths(markdown_file: Path, images_path: Path):
    """
    Update image paths in the markdown to point to the new images directory.
    """
    # Read the markdown file
    with open(markdown_file, 'r') as file:
        content = file.read()

    # Regex pattern to find all image references, such as ![](./image1.gif)
    image_pattern = re.compile(r'!\[\]\((.*?)\)')

    # Replace each image path with the new path in /public/images/blog/{slug}/
    def replace_image_path(match):
        old_image_path = match.group(1)  # Get the image path from the match
        image_name = Path(old_image_path).name  # Extract the image name from the path
        # Create the new path pointing to /public/images/blog/{images_path.name}/{image_name}
        new_image_path = f"/public/images/blog/{images_path.name}/{image_name}"
        return f"![]({new_image_path})"

    # Use regex to substitute all the image paths in the markdown content
    updated_content = image_pattern.sub(replace_image_path, content)

    # Write the updated markdown content back
    with open(markdown_file, 'w') as file:
        file.write(updated_content)

@app.route('/github-commit', methods=['POST'])
def github_commit():
    try:
        # Change to the directory containing your Git repository
        repo_dir = Path(__file__).parent.parent
        os.chdir(repo_dir)

        # Add all changes
        subprocess.run(['git', 'add', '.'], check=True)

        # Commit changes
        commit_message = "Add new blog post"
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)

        # Push changes
        subprocess.run(['git', 'push'], check=True)

        return jsonify({'success': True, 'message': 'Changes committed and pushed to GitHub successfully'})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Git operation failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# Serve static files
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('static', path)

# Start the Flask server in a thread and launch the PyWebView window
def start_server():
    # Flask runs on a separate thread in the background
    from threading import Thread
    server = Thread(target=lambda: app.run(port=8080))
    server.daemon = True
    server.start()

if __name__ == '__main__':
    start_server()
    webview.create_window("Blog Post Manager", "http://localhost:8080")
    webview.start()