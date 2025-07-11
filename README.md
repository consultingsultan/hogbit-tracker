# 🐷 Hogbit Tracker

A modern, feature-rich habit tracking app built with React and powered by PostHog analytics. Track your daily habits, build streaks, and visualize your progress with a beautiful, responsive interface.

![Hogbit Tracker](https://emoji.slack-edge.com/TSS5W8YQZ/hog-excited/8999998a2f173796.gif)

## ✨ Features

### 🎯 **Habit Management**
- Create custom habits with personalized colors and descriptions
- Set target frequencies (daily, weekly, etc.)
- Edit and delete habits with confirmation dialogs
- Track habit completion with intuitive cards

### 📊 **Progress Tracking**
- **Streak Counting**: Build and maintain daily streaks
- **Progress Visualization**: Weekly calendar view with completion status
- **Statistics Dashboard**: Success rates, completion counts, and achievements
- **Milestone Tracking**: Celebrate streak achievements (3, 7, 14, 30, 50, 100 days)

### 👤 **User Experience**
- **Email Authentication**: Secure login with email validation
- **Multi-User Support**: Clean logout system for shared devices
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Optimized for all screen sizes
- **Offline Ready**: LocalStorage persistence for reliable data

### 📈 **Analytics & Insights**
- **PostHog Integration**: Comprehensive user behavior tracking
- **Session Analytics**: Track user engagement and retention
- **Event Tracking**: Monitor habit completions, streak milestones, and user journeys
- **Privacy Focused**: User data remains in their browser

## 🚀 Live Demo

**Try it now**: [https://consultingsultan.github.io/hogbit-tracker/](https://consultingsultan.github.io/hogbit-tracker/)

## 🛠️ Tech Stack

- **Frontend**: React 18 with hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom dark mode
- **Icons**: Lucide React
- **Analytics**: PostHog
- **Deployment**: GitHub Pages with GitHub Actions
- **State Management**: React Context + useReducer
- **Storage**: LocalStorage with utility functions

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── WelcomeScreen.jsx    # User onboarding
│   ├── Dashboard.jsx        # Main dashboard
│   ├── HabitCard.jsx       # Individual habit cards
│   ├── AddHabitForm.jsx    # Create new habits
│   ├── EditHabitModal.jsx  # Edit existing habits
│   ├── ProgressView.jsx    # Progress visualization
│   └── ThemeToggle.jsx     # Dark mode toggle
├── context/             # React Context providers
│   ├── HabitContext.jsx    # Main app state
│   └── ThemeContext.jsx    # Theme management
├── hooks/               # Custom React hooks
│   ├── usePostHog.js       # PostHog analytics
│   └── useLocalStorage.js  # Storage utilities
├── utils/               # Utility functions
│   ├── dateUtils.js        # Date handling
│   ├── streakUtils.js      # Streak calculations
│   └── storageUtils.js     # LocalStorage management
└── styles/              # CSS and styling
```

## 📱 Screenshots

### Dashboard View
- Clean, intuitive interface
- Habit cards with completion status
- Quick stats overview
- Theme toggle and navigation

### Progress View
- Weekly calendar visualization
- Streak statistics
- Habit details and history
- Achievement milestones

### Welcome Screen
- Email authentication
- Beautiful onboarding flow
- Feature highlights
- Mobile-friendly design

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/consultingsultan/hogbit-tracker.git
cd hogbit-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_POSTHOG_KEY=your_posthog_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Build for Production
```bash
npm run build
```

## 📊 Analytics Events

The app tracks comprehensive user behavior with PostHog:

### User Journey
- `user_onboarded` - First-time user registration
- `user_returned` - Returning user login
- `user_session_started` - Session initiation
- `user_logged_out` - Session termination

### Habit Management
- `habit_created` - New habit added
- `habit_completed` - Habit marked as done
- `habit_edited` - Habit modified
- `habit_deleted` - Habit removed

### Engagement
- `dashboard_viewed` - Main dashboard access
- `progress_viewed` - Progress page visited
- `streak_milestone` - Streak achievements
- `daily_goal_achieved` - All habits completed
- `weekly_goal_achieved` - Perfect week completion

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interface
- **Responsive**: Mobile-first design approach
- **Accessible**: ARIA labels and keyboard navigation
- **Performant**: Optimized bundle size and loading
- **Privacy-First**: Data stays in the user's browser

## 🚀 Deployment

Automatically deployed to GitHub Pages using GitHub Actions:
- **Build**: Vite production build
- **Deploy**: GitHub Pages integration
- **CI/CD**: Automated testing and deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with assistance from [Claude Code](https://claude.ai/code)
- PostHog for comprehensive analytics
- Tailwind CSS for beautiful styling
- Lucide React for clean icons
- The React team for an amazing framework

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please [open an issue](https://github.com/consultingsultan/hogbit-tracker/issues) on GitHub.

---

**Made with ❤️ by [consultingsultan](https://github.com/consultingsultan)**

*Start building better habits today with Hogbit Tracker!* 🐷✨