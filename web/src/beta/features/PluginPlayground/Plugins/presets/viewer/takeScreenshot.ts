import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "take-screenshot-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: take-screenshot-plugin
name: Take Screenshot
version: 1.0.0
extensions:
  - id: take-screenshot
    type: widget
    name: Take Screenshot
    description: Take Screenshot
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "take-screenshot",
  title: "take-screenshot.js",
  sourceCode: `// / This plugin allows users to capture the current view in Re:earth, preview the screenshot, and download it as a PNG file.
  reearth.ui.show(\`
  <style>
    /* Generic styling system that provides consistent UI components and styling across all plugins */
    @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");

    /* Plugin-specific styling */

    #capturedImage {
      max-width: 100%;
      border: 1px solid #ccc;
      margin: 10px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .instructions {
      font-size: 13px;
      color: #666;
      text-align: center;
      font-style: italic;
    }
  </style>
  <div id="wrapper">
    <h2>Image Capture</h2>
    <p class="instructions">Adjust your view as needed, then capture the screenshot</p>
    <div class="flex-center">
      <button class="btn-primary" id="captureButton">Capture View</button>
    </div>
    <div id="imageContainer" style="display: none">
      <!-- Preview will appear here -->
    </div>
  </div>

  <script>
    // Get UI elements
    const captureButton = document.getElementById('captureButton');
    const imageContainer = document.getElementById('imageContainer');

    /**
     * Displays the captured image and creates download/retry buttons
     * @param {string} imageData - Base64 encoded image data
     */
    function displayImage(imageData) {
      // Clear any existing content in the container
      imageContainer.innerHTML = '';

      // Create and configure the image element
      const img = document.createElement('img');
      img.id = 'capturedImage';
      img.src = imageData;

      // Create a container for the buttons that uses the preset styles
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      buttonContainer.style.marginTop = '10px';

      // Create the download button with preset styles
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn-primary';
      downloadBtn.textContent = 'Download Image';

      // Add download functionality
      downloadBtn.addEventListener('click', () => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = imageData;

        // Generate filename with timestamp for uniqueness
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-');
        link.download = "reearth-capture-" + timestamp + ".png";

        // Trigger download and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Create the "Take Another" button with preset styles
      const anotherBtn = document.createElement('button');
      anotherBtn.className = 'btn-secondary';
      anotherBtn.textContent = 'Take Another';

      // Add functionality to hide preview and allow taking a new screenshot
      anotherBtn.addEventListener('click', () => {
        imageContainer.style.display = 'none';
      });

      // Add buttons to container
      buttonContainer.appendChild(downloadBtn);
      buttonContainer.appendChild(anotherBtn);

      // Add elements to the main container and show it
      imageContainer.appendChild(img);
      imageContainer.appendChild(buttonContainer);
      imageContainer.style.display = 'block';
    }

    // Add capture button click handler
    captureButton.addEventListener('click', () => {
      // Send capture request to parent window (Re:earth)
      parent.postMessage({
        type: 'capture-request'
      }, '*');
    });

    // Set up message event listener to receive responses from Re:earth
    window.addEventListener('message', e => {
      const msg = e.data;
      // Process the capture response
      if (msg.type === 'capture-response') {
        if (msg.error) {
          // Show error if capture failed
          alert('Failed to capture image: ' + msg.error);
        } else {
          // Display the captured image
          displayImage(msg.imageData);
        }
      }
    });

  </script>
\`);

// Set up the extension to handle messages from the UI
reearth.extension.on('message', msg => {
  // Handle the capture request from the UI
  if (msg.type === 'capture-request') {
    try {
      // Capture the current view as a PNG image
      const imageData = reearth.viewer.capture('image/png');

      // Check if capture was successful
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      // Send the image data back to the UI
      reearth.ui.postMessage({
        type: 'capture-response',
        imageData: imageData
      });
    } catch (error) {
      // Handle any errors during capture
      reearth.ui.postMessage({
        type: 'capture-response',
        error: error.message
      });
    }
  }
});`
};

export const takeScreenshot: PluginType = {
  id: "take-screenshot",
  files: [yamlFile, widgetFile]
};
