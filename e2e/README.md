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

3. **Set up the `.env` file:**

   Create a `.env` file in the root of the `e2e` folder and add the following variables:

   ```
   REEARTH_WEB_E2E_BASEURL=http://localhost:3000 OR DEV URL
   REEARTH_WEB_E2E_ACCOUNT=your_visualizer_account
   REEARTH_WEB_E2E_ACCOUNT_PASSWORD=your_visualizer_password
   ```

4. **Run tests:**

   ```
   npx playwright test
   ```

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.
