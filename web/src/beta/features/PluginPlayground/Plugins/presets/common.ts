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

/* Buttons */
button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:active {
  background: #DCDCDC;
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
  background: #F5F5F5;
}

.secondary-background {
  background: #FFFFFF;
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

.py-8 {
  padding-top: 8px;
  padding-bottom: 8px;
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

/* Text Color */
.text-primary {
  color: #007bff;
}

.text-subtitle {
  color: #666666;
}

/* Text Weight */
.font-bold {
  font-weight: bold;
}

/* Height */
.h-full {
  height: 100%;
}

/* Custom */
.radio-option {
  grid-template-columns: auto 80px 1fr;
  align-items: baseline;
}

.zoom-button {
  background: #FFFFFF;
  width: 90px;
  height: 40px;
}

.zoom-button img {
  display: block;
  width: 22px;
  height: 22px;
}

.rotate-btn:active {
  background: #DCDCDC;
}
  </style>
`;
