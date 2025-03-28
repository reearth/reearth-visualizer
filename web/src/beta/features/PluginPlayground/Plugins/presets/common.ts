export const PRESET_PLUGIN_COMMON_STYLE = `<style>
/* Plugin Playground Presets Generic Styling */

 * {
  box-sizing: border-box;
}

body,
html {
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333333;
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

 p {
  margin: 0;
 }

/* Buttons */
button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:active {
  background: #dcdcdc;
}

.btn-primary {
  background-color: #007bff;
  color: #ffffff;
}

.btn-primary:active {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #d32f2f;
  color: white;
}

.btn-danger:active {
  background-color: #6b0000;
}

.btn-neutral {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #cccccc;
}

.btn-neutral:active {
  background-color: #e6e6e6;
}

.btn-success {
  background-color: #4caf50;
  color: #ffffff;
}

.btn-success:active {
  background-color: #388e3c;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-padding {
  padding: 8px 16px;
}

/* Icon */
.icon-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

/* Form Elements */
input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  outline: none;
}

input:focus {
  border-color: #007bff;
}

input::placeholder {
  color: #999999;
  font-style: italic;
}

.empty {
  color: #999;
  font-style: italic;
}

/* Lists */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin: 8px 0;
  padding: 8px 12px;
  border-radius: 4px;
}

.styled-list-item {
  background-color: #ffffff;
  border: 1px solid #cccccc;
}

/* Layout */
.display-flex {
  display: flex;
}

.display-grid {
  display: grid;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

/* Background Colors */
.primary-background {
  background: #eeeeee;
}

.secondary-background {
  background: #ffffff;
}

.tertiary-background {
  background: #f9f9f9;
}

.quaternary-background {
  background: #0000000d;
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.hidden {
  display: none;
}

.invisible {
  visibility: hidden;
  opacity: 0;
}

/* Message display styling */
.message-display {
  background-color: #f8f8f8;
  border-left: 3px solid #0078D7;
  padding: 8px;
  min-height: 18px;
}

/* Horizontal divider for headings and sections */
.border-bottom {
  border-bottom: 1px solid #ccc;
}

/* Spacing Utilities */
.m-0 {
  margin: 0;
}

.mt-8 {
  margin-top: 8px;
}

.mt-16 {
  margin-top: 16px;
}

.mb-8 {
  margin-bottom: 8px;
}

.p-4 {
  padding: 4px;
}

.p-8 {
  padding: 8px;
}

.p-16 {
  padding: 16px;
}

.px-8 {
  padding-left: 8px;
  padding-right: 8px;
}

/* Gap */
.gap-4 {
  gap: 4px;
}

.gap-8 {
  gap: 8px;
}

.gap-16 {
  gap: 16px;
}

/* Box Shadow */
.primary-shadow {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Border Radius */
.rounded-sm {
  border-radius: 4px;
}

/* Font Family */
.font-monospace {
  font-family: monospace;
}

/* Font Size */
.text-sm {
  font-size: 12px;
}

.text-md {
  font-size: 14px;
}

.text-lg {
  font-size: 16px;
}

.text-xl {
  font-size: 20px;
}

.text-3xl {
  font-size: 24px;
}

/* Text Color */
.text-primary {
  color: #007bff;
}

.text-secondary {
  color: #666666;
}

/* Text Weight */
.font-bold {
  font-weight: bold;
}

/* Width */
.w-full {
  width: 100%;
}

.w-8 {
  width: 64px;
}

.w-10 {
  width: 80px;
}

.w-14 {
  width: 112px;
}

.w-16 {
  width: 128px;
}

/* Height */
.h-full {
  height: 100%;
}

.h-4 {
  height: 32px;
}

.h-5 {
  height: 40px;
}

.h-6 {
  height: 48px;
}

/* Custom */
.radio-option {
  grid-template-columns: auto 80px 1fr;
  align-items: baseline;
}

/* Slider */
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  }
  .toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  }
  .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
  }
  .slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  }
  input:checked + .slider {
  background-color: #2196F3;
  }
  input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
  }
  input:checked + .slider:before {
  transform: translateX(18px);
  }

  .divider {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 16px 0;
  }

  /* Theme Selector */
    .theme-content {
    transition: all 0.3s ease;
    border-radius: 4px;
    overflow: hidden;
  }

  .theme-content.light {
    color: #333333;
  }

  .theme-content.dark {
    color: #ffffff;
    background: #333333;
  }

  /* Storage Display */
   .storage-display {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .storage-op {
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    font-size: 13px;
  }

  #storageOps {
    max-height: 200px;
    overflow-y: auto;
  }
  </style>
`;
