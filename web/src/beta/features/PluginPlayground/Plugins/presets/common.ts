export const PRESET_PLUGIN_COMMON_STYLE = `<style>
  :root {
    --font-family: Arial, sans-serif;
    --border-radius: 5px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  body, h2, h3 {
    margin: 0;
    font-family: var(--font-family);
  }

  h2, h3 {
    text-align: center;
    margin-top: 40px;
  }

  #wrapper {
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 10px;
    position: relative;
  }
  </style>
`;
