# Quilly

Quilly is a mobile-first personal finance app built with React Native, TypeScript, Expo Router, and AsyncStorage. It helps users record daily income and expenses, review spending by week or month, and keep track of recurring financial activity without requiring a network connection.

## Features

- Add, edit, and delete income or expense transactions
- Browse transactions in calendar and list views
- Search transactions by category, note, or amount
- Create recurring income or expense schedules
- Review monthly income, expenses, and net balance
- Track weekly and monthly spending against budgets
- Persist app data locally with AsyncStorage
- Configure CAD/KRW currency, language, and daily notification preferences
- Manage payment reminders and local backup data

## Tech Stack

- React Native
- TypeScript
- Expo
- Expo Router
- AsyncStorage

## Getting Started

```bash
npm install
npm run start
```

Then open the app in Expo Go, an iOS simulator, an Android emulator, or the web preview.

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
```
