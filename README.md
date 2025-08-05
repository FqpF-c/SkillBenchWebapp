# SkillBench WebApp

A comprehensive learning platform with Firebase authentication, real-time progress tracking, and interactive content management.

## Firebase Structure

### Authentication
- **Phone Number + OTP**: Firebase Phone Authentication
- **Test Credentials**: 
  - Phone: `+911234567890`
  - OTP: `123456`

### Firestore Database Structure

#### User Data (`/skillbench/users/users/{phone_number}`)
```javascript
{
  username: "User's name",
  phone_number: "User's phone",
  college: "College name",
  department: "Department name", 
  batch: "Batch name",
  email: "Complete email",
  gender: "female/male/prefer_not_to_say",
  current_firebase_uid: "Firebase Auth UID",
  created_at: "Firestore Timestamp",
  last_login: "Firestore Timestamp",
  total_request: {
    practice_mode: 0,
    test_mode: 0
  },
  daily_usage: 0,
  total_usage: 0
}
```

#### Prep Content Structure
```
/prep/Title/{categoryId}/{categoryId}
├── Programming Language: ["C", "Java", "Python", ...]
├── Web Development: ["HTML", "CSS", "JavaScript", ...]
├── App Development: ["Flutter", "React Native", ...]
└── ...

/prep/Title/{categoryId}/{categoryId}/{subcategory}/Topics
├── C: ["C Introduction", "C Variables", "C Functions", ...]
├── Java: ["Java Basics", "Java OOP", "Java Collections", ...]
└── ...
```

### Realtime Database Structure

#### User Stats (`/skillbench/users/{user_id}`)
```javascript
{
  xp: 20,
  coins: 5,
  streaks: 0,
  study_hours: 0
}
```

#### Progress Data (`/skillbench/progress/{user_id}`)
```javascript
{
  programminglanguage_c_cintroduction: {
    type: "programming",
    subject: "Programming Language",
    subtopic: "C|C Introduction",
    progress: 75.5,
    bestScore: 85,
    totalAttempts: 10,
    totalCorrectAnswers: 85,
    totalQuestions: 100,
    lastUpdated: 1704067200000,
    averageScore: 78.5
  },
  academic_college_department_semester_subject_unit: {
    // Academic progress structure
  }
}
```

## Services Architecture

### Core Services

1. **FirebaseAuthService**: Handles phone authentication and OTP verification
2. **FirestoreService**: Manages user data and content in Firestore
3. **FirebaseRealtimeService**: Manages user stats and progress in Realtime Database
4. **PrepService**: Orchestrates content loading and progress tracking
5. **AuthContext**: Provides authentication state and user management

### Data Flow

1. **User Registration**:
   - Phone number input → OTP verification → User registration
   - Data stored in both Firestore and Realtime Database
   - Merged user data available in AuthContext

2. **Content Loading**:
   - Categories → Subcategories → Topics
   - Cached for 5 minutes to improve performance
   - Authentication required for all content access

3. **Progress Tracking**:
   - Topic progress stored in Realtime Database
   - Unique topic IDs generated from category/subcategory/topic
   - Real-time updates across devices

## Key Features

### Authentication
- ✅ Phone number authentication with OTP
- ✅ Test mode for development
- ✅ Automatic user data loading
- ✅ Session persistence

### Content Management
- ✅ Hierarchical content structure
- ✅ Dynamic category and topic loading
- ✅ Caching for performance
- ✅ Asset and color mapping

### Progress Tracking
- ✅ Real-time progress updates
- ✅ Comprehensive progress metrics
- ✅ Cross-device synchronization
- ✅ Academic and programming progress

### User Management
- ✅ Complete user profiles
- ✅ Stats tracking (XP, coins, streaks)
- ✅ Usage analytics
- ✅ College/department organization

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Set up Firebase project
   - Enable Phone Authentication
   - Configure Firestore and Realtime Database
   - Set environment variables

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Test Authentication**:
   - Use test phone: `+911234567890`
   - Use test OTP: `123456`

## API Reference

### AuthContext Methods
- `sendOTP(phoneNumber)`: Send OTP to phone number
- `verifyOTP(otp)`: Verify OTP and authenticate user
- `registerUser(userData)`: Register new user
- `updateUserStats(stats)`: Update user statistics
- `updateTopicProgress(categoryId, subcategory, topic, progressData)`: Update topic progress
- `getTopicProgress(categoryId, subcategory, topic)`: Get topic progress
- `signOut()`: Sign out user

### PrepService Methods
- `loadAllPrepData()`: Load all prep content
- `loadCategoryItems(categoryId)`: Load items for category
- `loadSubcategoryTopics(categoryId, subcategory)`: Load topics for subcategory
- `loadProgressData(topicIds)`: Load progress for topics
- `updateTopicProgress(categoryId, subcategory, topic, progressData)`: Update topic progress

### usePrepData Hook
- `prepData`: Current prep data state
- `loading`: Loading state
- `error`: Error state
- `refreshData()`: Refresh all data
- `loadCategoryItems(categoryId)`: Load category items
- `loadSubcategoryTopics(categoryId, subcategory)`: Load subcategory topics

## Database Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /skillbench/users/users/{phoneNumber} {
      allow read, write: if request.auth != null && request.auth.token.phone_number == phoneNumber;
    }
    match /prep/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### Realtime Database Rules
```json
{
  "rules": {
    "skillbench": {
      "users": {
        "$phoneNumber": {
          ".read": "auth != null && auth.token.phone_number == $phoneNumber",
          ".write": "auth != null && auth.token.phone_number == $phoneNumber"
        }
      },
      "progress": {
        "$phoneNumber": {
          ".read": "auth != null && auth.token.phone_number == $phoneNumber",
          ".write": "auth != null && auth.token.phone_number == $phoneNumber"
        }
      }
    }
  }
}
```

## Contributing

1. Follow the existing code structure
2. Use the established services for data operations
3. Implement proper error handling
4. Add caching where appropriate
5. Test with the provided test credentials

## License

This project is licensed under the MIT License.
