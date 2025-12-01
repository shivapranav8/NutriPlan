
  # Nutrition Planner App

  A modern, AI-powered nutrition planning application built with React and TypeScript, featuring scientifically validated calculations and OpenAI integration.

  ##  Scientific Foundation

  This app uses evidence-based formulas for all nutrition calculations:

  - **BMI**: Standard weight/height² formula
  - **BMR**: Mifflin-St Jeor equation (most accurate modern formula)
  - **TDEE**: BMR × scientifically validated activity multipliers
  - **Macros**: Evidence-based ratios optimized for different goals

  See [SCIENTIFIC_BASIS.md](./SCIENTIFIC_BASIS.md) for detailed scientific documentation.

  ##  Features

  - **AI-Powered Meal Suggestions**: Get personalized recommendations based on your profile
  - **Smart Meal Analysis**: AI analyzes your meal descriptions for accurate nutrition data
  - **Scientific Calculations**: Evidence-based BMI, BMR, TDEE, and macro calculations
  - **Data Persistence**: Your targets and meal logs are saved automatically
  - **Indian Cuisine Focus**: Optimized for Indian food items and nutrition patterns

  ##  Setup Instructions

  ### Prerequisites
  - Node.js (v16 or higher)
  - OpenAI API Key (optional, for AI features)

  ### Installation
  ```bash
  # Install dependencies
  npm install

  # Set up environment variables (optional)
  echo "OPENAI_API_KEY=your-openai-api-key-here" > .env

  # Start both frontend and backend
  npm start
  ```

  ### Manual Setup
  ```bash
  # Start backend server
  node server.js

  # Start frontend (in another terminal)
  npm run dev
  ```

  ##  Usage

  1. **Complete Onboarding**: Enter your profile information
  2. **View Targets**: See your calculated BMI, BMR, TDEE, and macro targets
  3. **Get AI Suggestions**: Use AI-powered meal recommendations
  4. **Log Meals**: Track your daily food intake
  5. **Monitor Progress**: Real-time tracking against your targets

  ## Scientific Accuracy

  The app uses the most accurate and widely accepted formulas:

  - **Mifflin-St Jeor BMR equation** (validated in 1990, most accurate)
  - **Standard activity multipliers** (1.2-1.9 range)
  - **Evidence-based macro ratios** for different goals
  - **Sustainable caloric adjustments** (±300-500 kcal)

  ##  Documentation

  - [Setup Guide](./SETUP.md) - Detailed setup instructions
  - [Scientific Basis](./SCIENTIFIC_BASIS.md) - Complete scientific documentation
  - [API Documentation](./API.md) - Backend API endpoints

  ##  Goals Supported

  - **Weight Loss**: Higher protein, moderate deficit
  - **Weight Gain**: Balanced surplus, adequate protein
  - **Maintenance**: Balanced macros, TDEE calories

  ##  AI Features (Requires OpenAI API Key)

  - Personalized meal suggestions based on your profile
  - Smart nutrition analysis of meal descriptions
  - Indian cuisine optimization
  - Goal-specific recommendations

  ##  Development

  ```bash
  # Start development servers
  npm run dev          # Frontend
  npm run server:dev   # Backend with auto-restart

  # Build for production
  npm run build
  ```

  ## License

  This project is available under the MIT License.
  
