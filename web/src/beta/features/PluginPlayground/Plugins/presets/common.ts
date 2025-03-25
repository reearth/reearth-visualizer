export const PRESET_PLUGIN_COMMON_STYLE = `<style>

  /* Plugin Playground Presets Generic Styling */

/* Base & Typography */

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

h2,
h3 {
  text-align: center;
  margin: 0 0 12px 0;
}

h2 {
  font-size: 24px;
}

h3 {
  font-size: 20px;
}

/* Background Colors */
.primary-background {
  background-color: #ffffff;
}

/* Buttons */
button {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  border: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:active {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-secondary:active {
  background-color: #e6f0ff;
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Icon */
.icon-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

/* Button layout */
.button-container {
  display: flex;
  justify-content: center;
  gap: 10px;
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

/* Small Text Utility */
.small-text {
  font-size: 12px;
  color: #666666;
}

/* Info Sections */
.info-toggle {
  padding: 6px 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.info-content {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
}

/* Layout */
#wrapper {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
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
  gap: 8px;
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

/* Spacing Utilities */
.mt-8 {
  margin-top: 8px;
}
.mt-16 {
  margin-top: 16px;
}
.mb-8 {
  margin-bottom: 8px;
}
.mb-16 {
  margin-bottom: 16px;
}
.my-8 {
  margin-top: 8px;
  margin-bottom: 8px;
}
.mx-8 {
  margin-left: 8px;
  margin-right: 8px;
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
.py-8 {
  padding-top: 8px;
  padding-bottom: 8px;
}
  </style>
`;
