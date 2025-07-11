# Habit Tracker Development Notes

## Commands to Run
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

The habit tracker is a complete React application with the following structure:

### Core Features Implemented:
1. **Welcome/Onboarding Screen** - User registration with validation
2. **Main Dashboard** - Today's habits, stats, and quick actions
3. **Habit Management** - Add, edit, delete habits with color coding
4. **Habit Tracking** - Complete/uncomplete habits with streak tracking
5. **Progress View** - Weekly calendar view and detailed statistics
6. **Dark Mode** - Complete dark theme with system preference detection and manual toggle
7. **PostHog Analytics** - Comprehensive event tracking for user behavior and milestone achievements

### Technical Implementation:
- **State Management**: React Context + useReducer pattern
- **Data Persistence**: localStorage with automatic sync
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React icons
- **Date Handling**: Custom utility functions
- **Streak Calculation**: Advanced algorithms for tracking consecutive days
- **Analytics**: PostHog integration with comprehensive event tracking

### Key Components:
- `WelcomeScreen.jsx` - User onboarding with dark mode toggle and user_onboarded tracking
- `Dashboard.jsx` - Main app interface with dashboard_viewed and daily_goal_achieved events
- `HabitCard.jsx` - Individual habit display with habit_completed and streak_milestone tracking
- `AddHabitForm.jsx` - Create new habits with habit_created events
- `EditHabitModal.jsx` - Modify existing habits with habit_edited tracking
- `ProgressView.jsx` - Statistics and calendar view with progress_viewed and weekly_goal_achieved events
- `ThemeToggle.jsx` - Dark/light mode toggle component
- `ThemeContext.jsx` - Theme state management with system preference detection
- `usePostHog.js` - Custom hook for safe PostHog event tracking with error handling

### Data Structure:
- **User**: `{id, name, createdAt}`
- **Habit**: `{id, name, description, color, targetFrequency, isActive, createdAt}`
- **Completion**: `{id, habitId, completedAt, date}`

### Features:
- Responsive mobile-first design
- **Complete dark mode implementation** with system preference detection
- **Smooth theme transitions** with proper color contrast
- **Comprehensive PostHog analytics** with 12+ custom events tracking user behavior
- Celebration animations for completions
- Streak tracking with fire emoji indicators and milestone achievements
- Weekly calendar view with completion status
- Color-coded habits
- Progress statistics (current streak, best streak, completion rate)
- Data export/import functionality (prepared)
- Form validation and error handling
- Loading states and smooth transitions
- **Theme toggle** available on all screens
- **Dark-optimized colors** for readability and accessibility

### PostHog Events Tracked:
**Habit Management:**
- `habit_created` - When user creates new habit (includes name, color, frequency)
- `habit_completed` - When user marks habit complete (includes streak count, completion time)
- `habit_deleted` - When user deletes habit (includes total completions, habit age)
- `habit_edited` - When user modifies habit (includes before/after comparison)

**User Journey:**
- `user_onboarded` - When user completes welcome screen
- `dashboard_viewed` - When user visits main dashboard
- `progress_viewed` - When user checks progress/stats

**Milestones:**
- `streak_milestone` - When user reaches streak milestones (3, 7, 14, 30+ days)
- `daily_goal_achieved` - When user completes all habits for the day
- `weekly_goal_achieved` - When user meets weekly completion targets

### Ready for Extensions:
- PostHog analytics integration points are identified
- Event tracking structure is in place
- Component architecture supports easy feature additions

The app is production-ready and works immediately with `npm run dev`.