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

    .instructions {
      font-size: 13px;
      color: #666;
      text-align: center;
      font-style: italic;
    }

    #imageContainer {
      text-align: center;
    }

    #capturedImage, .image-download-btn {
      max-width: 100%;
      margin: 10px auto;
    }
  </style>
  <div id="wrapper">
    <h2>Image Capture</h2>
    <p class="instructions">Adjust your view as needed, then capture the screenshot</p>
    <div class="flex-center">
      <button class="btn-primary" id="captureButton">Capture View</button>
    </div>
    <div id="imageContainer">
      <!-- Preview will appear here -->
    </div>
  </div>

  <script>
    // Get UI elements
    const captureButton = document.getElementById('captureButton');
    const imageContainer = document.getElementById('imageContainer');

    /**
     * Displays the captured image and adds download functionality
     * @param {string} imageData - Base64 encoded image data
     */
    function displayImage(imageData) {
      // Clear any existing content in the container
      imageContainer.innerHTML = '';

      // Create and configure the image element
      const img = document.createElement('img');
      img.id = 'capturedImage';
      img.src = imageData;

      // Create download button with appropriate class for styling
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn-primary image-download-btn';
      downloadBtn.textContent = 'Download Image';

      // Add download functionality
      downloadBtn.addEventListener('click', () => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = imageData;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = "reearth-capture-" + timestamp + ".png";

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Add elements to the container and show it
      imageContainer.appendChild(img);
      imageContainer.appendChild(downloadBtn);
    }

    // Add capture button click handler
    captureButton.addEventListener('click', () => {
      // Send a message to the extension to request a capture
      parent.postMessage({ type: 'capture-request' }, '*');
    });

    // Listen for messages from Re:earth
    window.addEventListener('message', e => {
      const msg = e.data;
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
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on('message', msg => {
  if (msg.type === 'capture-request') {
    try {
      // Capture the current view as a PNG image
      // Documentation for Viewer "capture" method: https://visualizer.developer.reearth.io/plugin-api/viewer/#capture
      const imageData = reearth.viewer.capture('image/png');

      // Check if capture was successful and send response
      // Documentation for UI "postMessage" method: https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
      reearth.ui.postMessage({
        type: 'capture-response',
        imageData: imageData || null,
        error: !imageData ? 'Failed to capture image' : null
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
