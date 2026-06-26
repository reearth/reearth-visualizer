# QA-Automation - Playwright Project

This project is a Playwright framework setup that follows the Page Object Design Pattern. It is structured to facilitate easy maintenance and scalability of test automation scripts.

## Project Structure

```
├── pages
│   ├── projectPage.ts
│   ├── loginPage.ts
│   └── dashboardPage.ts
│   └── projectScreenPage.ts
│   └── recycleBinPage.ts
|
├── tests
│   ├── login.spec.ts      # Test cases for the LoginPage
│   └── dashboardPage.spec.ts  # Test cases for the DashboardPage
│   └── Projects.spec.ts   # Test cases for the ProjectScreenPage
|
├── test-Data
│   ├── testData.ts        # contains test data used in the tests
|
├── playwright.config.ts        # Configuration file for Playwright
├── package.json                # npm configuration file with dependencies and scripts
├── tsconfig.json               # TypeScript configuration file
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository:**

   ```
   cd e2e
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Set up environment variables:**

   **Option 1: Traditional `.env` file**

   ```bash
   cp env.example .env
   # Fill in values — consult the team for credentials
   ```

   **Option 2: 1Password CLI (Recommended)**

   ```bash
   # One-time setup — requires access to the Visualizer vault
   op signin
   # Create .env.op with op:// references for each variable in env.example
   # (see ONBOARDING.md for the exact format)
   # Then run tests directly with:
   npm run test:ui:op
   npm run test:api:op
   ```

   See [ONBOARDING.md](ONBOARDING.md) for full setup details.

4. **Run tests:**

   ```
   npx playwright test
   ```

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.
