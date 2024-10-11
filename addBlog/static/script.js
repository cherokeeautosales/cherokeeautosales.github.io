document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const fullPageDropArea = document.getElementById('full-page-drop-area');
    const fileInput = document.getElementById('file');
    const fileInfo = document.getElementById('file-info');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Handle drag enter
    document.body.addEventListener('dragenter', () => {
        fullPageDropArea.classList.add('active');
    });

    // Handle drag leave
    fullPageDropArea.addEventListener('dragleave', (e) => {
        if (e.target === fullPageDropArea) {
            fullPageDropArea.classList.remove('active');
        }
    });

    // Handle drop
    fullPageDropArea.addEventListener('drop', handleDrop);

    // Handle click to select file
    fileInfo.addEventListener('click', () => fileInput.click());

    // Handle file selection
    fileInput.addEventListener('change', handleFiles);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        preventDefaults(e);
        fullPageDropArea.classList.remove('active');
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }

    function handleFiles(e) {
        const files = e.target.files;
        if (files.length > 0) {
            fileInfo.querySelector('p').textContent = `Selected file: ${files[0].name}`;
        } else {
            fileInfo.querySelector('p').textContent = 'No file selected';
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });


    const githubCommitButton = document.getElementById('github-commit');
    
    githubCommitButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/github-commit', {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        }
    });

    window.addEventListener('beforeunload', async (event) => {
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = '';

        try {
            // Send a request to kill the server
            await fetch('/kill', { method: 'POST' });
        } catch (error) {
            console.error('Failed to kill server:', error);
        }
    });
});