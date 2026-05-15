# Playwright Automation Testing for NopCommerce

Automation testing project for the NopCommerce Demo website using Playwright and TypeScript.

## Website Under Test

[NopCommerce Demo Website](https://demo.nopcommerce.com/)

---

# Project Overview

This project focuses on manual testing and automation testing for the NopCommerce e-commerce website.

The automation framework is developed using:

* Playwright
* TypeScript
* Page Object Model (POM)

The project covers several main modules:

* Register
* Search
* Product Category
* Shopping Cart
* Product Review

---

# Technologies Used

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| Playwright         | Automation Testing Framework |
| TypeScript         | Programming Language         |
| NodeJS             | Runtime Environment          |
| Visual Studio Code | IDE                          |
| Git/GitHub         | Version Control              |

---

# Framework Features

* Page Object Model (POM)
* Data Driven Testing
* HTML Report
* Screenshot on Failure
* Video Recording on Failure
* Trace Viewer Support
* Parallel Execution

---

# Project Structure

```text id="nr0vsm"
PLAYWRIGHT-NOPCOMMERCE
│
├── .github/
│   └── workflows/
│
├── helpers/
│
├── logs/
│
├── pages/
│   ├── base.page.ts
│   ├── register.page.ts
│   ├── search.page.ts
│   ├── category.page.ts
│   ├── cart.page.ts
│   └── review.page.ts
│
├── playwright-report/
│
├── test-results/
│
├── tests/
│   ├── data/
│   ├── specs/
│   └── types/
│
├── package.json
├── package-lock.json
└── playwright.config.ts
```

---

# Installation

## 1. Clone repository

```bash id="wjlwm0"
git clone https://github.com/Hoai13/Playwright-nopCommerce.git
```

---

## 2. Install dependencies

```bash id="jlwm4j"
npm install
```

---

## 3. Install Playwright browsers

```bash id="0u8wqk"
npx playwright install
```

---

# Run Automation Tests

## Run all tests

```bash id="jqpdlt"
npx playwright test
```

---

## Run a specific test file

Example:

```bash id="w7c6hf"
npx playwright test tests/specs/01_register.spec.ts
```

---

## Run tests in UI Mode

```bash id="dvlk57"
npx playwright test --ui
```

UI Mode supports:

* Debugging test execution
* Viewing Trace Viewer
* Running individual test cases

---

# HTML Report

Open Playwright HTML Report:

```bash id="e3r1tf"
npx playwright show-report
```

---

# Screenshot, Video and Trace

When a test fails:

* Screenshot
* Video
* Trace

will be automatically saved in:

```text id="1bhytf"
test-results/
```

---

# Test Modules

| Module           | Description                        |
| ---------------- | ---------------------------------- |
| Register         | User registration validation       |
| Search           | Product search and filtering       |
| Product Category | Category navigation and pagination |
| Shopping Cart    | Cart validation and management     |
| Product Review   | Product review and rating          |

---

# Automation Framework Design

The framework is built using:

* Playwright Test Runner
* TypeScript
* Page Object Model (POM)

The project separates:

* Test scripts
* Page Objects
* Test data
* Helper functions

to improve:

* Reusability
* Maintainability
* Scalability

---

# Author

Nguyễn Thị Hoài
Quy Nhon University
Software Engineering

---
