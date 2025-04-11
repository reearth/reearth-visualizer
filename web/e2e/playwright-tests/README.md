# QA-Automation - Playwright Project

This project is a Playwright framework setup that follows the Page Object Design Pattern. It is structured to facilitate easy maintenance and scalability of test automation scripts.

## Project Structure

```
├── pages
│   │   └── homePage.ts        # Contains the HomePage class with methods specific to the home page
│   ├── tests
│   │   ├── homePage.test.ts   # Test cases for the HomePage
│ └── utils         # Utility functions for the project
├── playwright.config.ts        # Configuration file for Playwright
├── package.json                # npm configuration file with dependencies and scripts
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**

   ```
   cd playwright-project
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Run tests:**
   ```
   npx playwright test
   ```

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.
