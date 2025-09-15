/**
 * Database path builders that mirror the Flutter app's structure
 * All paths should use the same UID semantics as the Flutter app
 */

// Firestore paths (matching Flutter app structure)
export const firestorePaths = {
  // User profile data: skillbench/users/users/{uid}
  usersDoc: (uid: string) => `skillbench/users/users/${uid}`,
  
  // Prep content paths
  prepTitle: () => 'prep/Title',
  prepTitleCategory: (categoryId: string) => `prep/Title/${categoryId}`,
  prepTitleSubcategory: (categoryId: string, subcategoryId: string) => 
    `prep/Title/${categoryId}/${categoryId}/${subcategoryId}`,
  prepTopicContent: (categoryId: string, subcategoryId: string, topicName: string) =>
    `prep/Title/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/content`,
  prepTopicQuiz: (categoryId: string, subcategoryId: string, topicName: string) =>
    `prep/Title/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/quiz`,
  prepTopicResources: (categoryId: string, subcategoryId: string, topicName: string) =>
    `prep/Title/${categoryId}/${categoryId}/${subcategoryId}/Topics/${topicName}/resources`,
};

// Realtime Database paths (matching Flutter app structure)
export const realtimePaths = {
  // User stats and data: skillbench/users/{uid}
  userRoot: (uid: string) => `skillbench/users/${uid}`,
  
  // User progress: skillbench/users/{uid}/progress/{subjectId}
  userProgress: (uid: string) => `skillbench/users/${uid}/progress`,
  userProgressSubject: (uid: string, subjectId: string) => `skillbench/users/${uid}/progress/${subjectId}`,
  
  // Quiz sessions (if needed)
  quizSession: (uid: string, sessionId: string) => `skillbench/quiz_sessions/${uid}/${sessionId}`,
  
  // Leaderboard paths
  leaderboardAllTime: (uid: string) => `leaderboard/all_time/${uid}`,
  leaderboardWeekly: (weekStart: string, uid: string) => `leaderboard/weekly/${weekStart}/${uid}`,
};

// Helper functions for generating IDs (matching Flutter app logic)
export const generateSubjectId = (type: string, subject: string, subtopic: string, additionalData?: Record<string, any>) => {
  const normalizeString = (input: string) => {
    return input
      .replaceAll(' ', '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  };

  if (type === 'academic') {
    const college = additionalData?.college || '';
    const department = additionalData?.department || '';
    const semester = additionalData?.semester || '';
    return `academic_${normalizeString(college)}_${normalizeString(department)}_${normalizeString(semester)}_${normalizeString(subject)}_${normalizeString(subtopic)}`;
  } else if (type === 'programming') {
    // New format: {main_topic}_{subtopic}_{topic}
    if (subtopic.includes('|')) {
      const parts = subtopic.split('|');
      const actualSubtopic = parts[0]; // e.g., "C"
      const actualTopic = parts[1]; // e.g., "C Introduction"

      const normalizedMainTopic = normalizeString(subject); // programminglanguage
      const normalizedSubtopic = normalizeString(actualSubtopic); // c
      const normalizedTopic = normalizeString(actualTopic); // cintroduction

      return `${normalizedMainTopic}_${normalizedSubtopic}_${normalizedTopic}`;
    }

    // Fallback for direct calls
    const normalizedMainTopic = normalizeString(subject);
    const normalizedSubtopic = normalizeString(subtopic);
    return `${normalizedMainTopic}_${normalizedSubtopic}_${normalizedSubtopic}`;
  }

  // Fallback for other types
  return `${normalizeString(type)}_${normalizeString(subject)}_${normalizeString(subtopic)}`;
};

// Session ID generator (matching Flutter app)
export const generateSessionId = (uid: string) => `${Date.now()}_${uid}`;

// Topic progress ID generator (matching Flutter app logic)
export const generateTopicProgressId = (categoryId: string, subcategory: string, topic: string) => {
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
  };

  const normalizedCategory = normalizeString(categoryId);
  const normalizedSubcategory = normalizeString(subcategory);
  const normalizedTopic = normalizeString(topic);

  return `${normalizedCategory}_${normalizedSubcategory}_${normalizedTopic}`;
};