class QuizService {
  static programmingEndpoint = 'https://prepbackend.onesite.store/prep/generate-questions';
  static academicEndpoint = 'https://prepbackend.onesite.store/quiz';
  static templateCache = new Map();

  static fallbackTemplates = {
    programming_practice: `Generate {count} multiple-choice questions about {programmingLanguage} focusing on {subTopic}.

Requirements:
- Questions should be practical and test real coding knowledge
- Include code snippets where appropriate
- Difficulty should be varied (easy, medium, hard)
- Each question must have exactly 4 options (A, B, C, D)
- Provide clear explanations for correct answers
- Include helpful hints for each question

Format each question as JSON with:
- "question": the question text
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": "easy", "medium", or "hard"
- "hint": helpful hint for solving

Focus on: {mainTopic} - {subTopic} in {programmingLanguage}`,

    programming_practice_adaptive: `Generate {count} adaptive multiple-choice questions about {programmingLanguage} focusing on {subTopic}.

Performance Analysis:
{performanceAnalysis}

Adaptive Requirements:
- Focus more on weak topics: {weakTopics}
- Reduce emphasis on strong topics: {strongTopics}
- Adjust difficulty based on overall accuracy: {overallAccuracy}%
- Consider time patterns: average {averageTime}s per question
- Include broader conceptual questions for weak areas
- Add advanced questions for strong areas

Generate questions that:
1. Address identified weaknesses with foundational concepts
2. Reinforce learning in problem areas
3. Challenge strengths with harder variations
4. Include cross-topic questions that combine weak and strong areas
5. Provide scaffolded difficulty progression

Difficulty Distribution for Adaptive Questions:
- If accuracy < 60%: 50% easy, 40% medium, 10% hard
- If accuracy 60-80%: 30% easy, 50% medium, 20% hard  
- If accuracy > 80%: 20% easy, 40% medium, 40% hard

Format each question as JSON with:
- "question": the question text (adaptive difficulty)
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": adjusted based on performance
- "hint": helpful hint
- "topic": specific topic addressed
- "adaptive_reason": why this question was selected
- "is_adaptive": true

Focus on: {mainTopic} - {subTopic} in {programmingLanguage}`,

    programming_test: `Generate {count} comprehensive test questions about {programmingLanguage} focusing on {subTopic}.

Test Requirements:
- Mix of conceptual and practical questions
- Progressive difficulty (30% easy, 50% medium, 20% hard)
- Include code analysis questions
- Test both syntax and logical understanding
- Each question must have exactly 4 options (A, B, C, D)
- Provide detailed explanations for learning
- Include helpful hints

Format each question as JSON with:
- "question": the question text
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": "easy", "medium", or "hard"
- "hint": helpful hint for solving

Focus on: {mainTopic} - {subTopic} in {programmingLanguage}`,

    academic_practice: `Generate {count} multiple-choice questions for {subject} - {unit}.

Requirements:
- Questions should cover key concepts from the unit
- Mix of theoretical and applied questions
- Difficulty should be appropriate for {semester} students
- Each question must have exactly 4 options (A, B, C, D)
- Provide clear explanations for correct answers
- Include helpful hints for each question

Format each question as JSON with:
- "question": the question text
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": "easy", "medium", or "hard"
- "hint": helpful hint for solving

Context: {college} - {department} - {semester} - {subject} - {unit}`,

    academic_practice_adaptive: `Generate {count} adaptive multiple-choice questions for {subject} - {unit}.

Performance Analysis:
{performanceAnalysis}

Adaptive Requirements for Academic Content:
- Weak topic areas: {weakTopics}
- Strong topic areas: {strongTopics}
- Overall comprehension: {overallAccuracy}%
- Learning pace: {averageTime}s per question

Generate questions that:
1. Reinforce weak conceptual areas with foundational questions
2. Build upon strong areas with application questions
3. Include interdisciplinary connections for better understanding
4. Focus on practical applications of theoretical concepts
5. Scale difficulty appropriately for learning progression

Format each question as JSON with:
- "question": the question text (adaptive difficulty)
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": adjusted based on performance
- "hint": helpful hint
- "topic": specific topic addressed
- "adaptive_reason": why this question was selected
- "is_adaptive": true

Context: {college} - {department} - {semester} - {subject} - {unit}`,

    academic_test: `Generate {count} comprehensive test questions for {subject} - {unit}.

Test Requirements:
- Cover all major topics in the unit
- Progressive difficulty distribution
- Mix of factual recall and application questions
- Each question must have exactly 4 options (A, B, C, D)
- Provide detailed explanations
- Include helpful hints

Format each question as JSON with:
- "question": the question text
- "options": array of 4 choices
- "correct_answer": the correct option
- "explanation": detailed explanation
- "difficulty": "easy", "medium", or "hard"
- "hint": helpful hint for solving

Context: {college} - {department} - {semester} - {subject} - {unit}`
  };

  static async getPromptTemplate({
    type,
    mode,
    categoryId = null,
    subcategory = null,
    topic = null,
    customPrompt = null,
    isAdaptive = false
  }) {
    if (customPrompt) {
      return customPrompt;
    }

    const templateKey = isAdaptive ? `${type}_${mode}_adaptive` : `${type}_${mode}`;
    
    if (this.templateCache.has(templateKey)) {
      return this.templateCache.get(templateKey);
    }

    return this.fallbackTemplates[templateKey] || this.fallbackTemplates[`${type}_practice`] || '';
  }

  static fillPromptTemplate({ template, params, count, performanceData = null }) {
    let filled = template;
    
    Object.entries(params).forEach(([key, value]) => {
      filled = filled.replaceAll(`{${key}}`, value);
    });
    
    filled = filled.replaceAll('{count}', count.toString());
    
    if (performanceData) {
      filled = filled.replaceAll('{performanceAnalysis}', performanceData.analysis || 'No performance data available');
      filled = filled.replaceAll('{weakTopics}', performanceData.weakTopics?.join(', ') || 'None identified');
      filled = filled.replaceAll('{strongTopics}', performanceData.strongTopics?.join(', ') || 'None identified');
      filled = filled.replaceAll('{overallAccuracy}', (performanceData.overallAccuracy || 0).toString());
      filled = filled.replaceAll('{averageTime}', (performanceData.averageTime || 30).toString());
      filled = filled.replaceAll('{recommendedDifficulty}', performanceData.recommendedDifficulty || 'Medium');
    }
    
    return filled;
  }

  static async generateProgrammingQuestions({
    mainTopic,
    programmingLanguage,
    subTopic,
    count = 10,
    setCount = 0,
    customPrompt = null,
    modelType = null,
    mode = 'practice',
    categoryId = null,
    subcategory = null,
    topic = null,
    performanceData = null
  }) {
    const templateParams = {
      mainTopic,
      programmingLanguage,
      subTopic
    };

    const isAdaptive = performanceData && Object.keys(performanceData).length > 0;
    
    const baseTemplate = await this.getPromptTemplate({
      type: 'programming',
      mode,
      categoryId,
      subcategory,
      topic,
      customPrompt,
      isAdaptive
    });

    const promptTemplate = this.fillPromptTemplate({
      template: baseTemplate,
      params: templateParams,
      count,
      performanceData
    });

    const body = {
      mainTopic,
      programmingLanguage,
      subTopic,
      count,
      setCount,
      promptTemplate,
      mode,
      isAdaptive,
      performanceData,
      ...(customPrompt && { customPrompt }),
      ...(modelType && { modelType }),
      ...(categoryId && { categoryId }),
      ...(subcategory && { subcategory }),
      ...(topic && { topic })
    };

    console.log('API Request:', this.programmingEndpoint);
    console.log('Request body:', JSON.stringify(body, null, 2));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(this.programmingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Response body length:', responseText.length);
        console.log('Response body preview:', responseText.substring(0, Math.min(500, responseText.length)));
        
        try {
          const data = JSON.parse(responseText);
          console.log('API Response:', data);
          
          if (Array.isArray(data)) {
            const questions = data;
            
            if (isAdaptive) {
              questions.forEach(question => {
                question.is_adaptive = true;
                question.generated_from_performance = true;
              });
            }
            
            console.log(`Successfully parsed ${questions.length} questions`);
            return questions;
          } else {
            console.error('Data is not an array, type:', typeof data);
            throw new Error(`Invalid response format: Expected Array, got ${typeof data}`);
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.error('Raw response:', responseText);
          throw new Error(`Failed to parse server response: ${parseError.message}`);
        }
      } else {
        console.error('Server error - Status:', response.status);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        try {
          const error = JSON.parse(errorText);
          throw new Error(`Server error (${response.status}): ${error.error || error.message || 'Unknown error'}`);
        } catch (parseError) {
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      console.error('Network or other error:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async generateAcademicQuestions({
    college,
    department,
    semester,
    subject,
    unit,
    count = 10,
    setCount = 0,
    customPrompt = null,
    mode = 'practice',
    performanceData = null
  }) {
    const templateParams = {
      college,
      department,
      semester,
      subject,
      unit
    };

    const isAdaptive = performanceData && Object.keys(performanceData).length > 0;

    const baseTemplate = await this.getPromptTemplate({
      type: 'academic',
      mode,
      customPrompt,
      isAdaptive
    });

    const promptTemplate = this.fillPromptTemplate({
      template: baseTemplate,
      params: templateParams,
      count,
      performanceData
    });

    const body = {
      college,
      department,
      semester,
      subject,
      unit,
      count,
      setCount,
      promptTemplate,
      mode,
      isAdaptive,
      performanceData
    };

    const response = await fetch(this.academicEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        const content = data.files[0].content;
        const parsed = JSON.parse(content);
        const questions = parsed.questions;
        
        if (isAdaptive) {
          questions.forEach(question => {
            question.is_adaptive = true;
            question.generated_from_performance = true;
          });
        }
        
        return questions;
      }
      throw new Error('Invalid response format');
    } else {
      const error = await response.json();
      throw new Error(`Server error: ${error.error || 'Unknown'}`);
    }
  }

  static async generatePracticeQuestions({ type, params }) {
    return type === 'programming'
      ? await this.generateProgrammingQuestions({
          mainTopic: params.mainTopic,
          programmingLanguage: params.programmingLanguage,
          subTopic: params.subTopic,
          count: 10,
          setCount: 0,
          mode: 'practice',
          categoryId: params.categoryId,
          subcategory: params.subcategory,
          topic: params.topic
        })
      : await this.generateAcademicQuestions({
          college: params.college,
          department: params.department,
          semester: params.semester,
          subject: params.subject,
          unit: params.unit,
          count: 10,
          setCount: 0,
          mode: 'practice'
        });
  }

  static requestInProgress = new Map();

  static async generateTestQuestions({ type, params }) {
    const requestKey = `${type}_${JSON.stringify(params)}`;
    
    if (this.requestInProgress.has(requestKey)) {
      console.log('Request already in progress, waiting for existing request...');
      return await this.requestInProgress.get(requestKey);
    }

    const requestPromise = this._executeTestQuestionGeneration({ type, params });
    this.requestInProgress.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestInProgress.delete(requestKey);
    }
  }

  static async _executeTestQuestionGeneration({ type, params }) {
    try {
      console.log('Generating all 20 questions in single request...');
      
      const questions = type === 'programming'
        ? await this.generateProgrammingQuestions({
            mainTopic: params.mainTopic,
            programmingLanguage: params.programmingLanguage,
            subTopic: params.subTopic,
            count: 20,
            setCount: 0,
            mode: 'test',
            categoryId: params.categoryId,
            subcategory: params.subcategory,
            topic: params.topic
          })
        : await this.generateAcademicQuestions({
            college: params.college,
            department: params.department,
            semester: params.semester,
            subject: params.subject,
            unit: params.unit,
            count: 20,
            setCount: 0,
            mode: 'test'
          });

      const validQuestions = this.validateQuestions(questions);
      console.log(`Generated ${validQuestions.length} valid questions in single request`);
      
      if (validQuestions.length < 15) {
        console.log('Insufficient questions, trying fallback...');
        
        try {
          const fallbackQuestions = type === 'programming'
            ? await this.generateProgrammingQuestions({
                mainTopic: params.mainTopic,
                programmingLanguage: params.programmingLanguage,
                subTopic: params.subTopic,
                count: 18,
                setCount: 0,
                mode: 'practice',
                categoryId: params.categoryId,
                subcategory: params.subcategory,
                topic: params.topic
              })
            : await this.generateAcademicQuestions({
                college: params.college,
                department: params.department,
                semester: params.semester,
                subject: params.subject,
                unit: params.unit,
                count: 18,
                setCount: 0,
                mode: 'practice'
              });
          
          return this.validateQuestions(fallbackQuestions);
        } catch (fallbackError) {
          throw new Error(`All generation methods failed: ${fallbackError.message}`);
        }
      }
      
      return validQuestions;
      
    } catch (error) {
      console.error('Single request failed:', error);
      
      try {
        console.log('Falling back to practice mode...');
        
        const fallbackQuestions = type === 'programming'
          ? await this.generateProgrammingQuestions({
              mainTopic: params.mainTopic,
              programmingLanguage: params.programmingLanguage,
              subTopic: params.subTopic,
              count: 15,
              setCount: 0,
              mode: 'practice',
              categoryId: params.categoryId,
              subcategory: params.subcategory,
              topic: params.topic
            })
          : await this.generateAcademicQuestions({
              college: params.college,
              department: params.department,
              semester: params.semester,
              subject: params.subject,
              unit: params.unit,
              count: 15,
              setCount: 0,
              mode: 'practice'
            });
        
        return this.validateQuestions(fallbackQuestions);
      } catch (fallbackError) {
        throw new Error(`Unable to generate test questions after multiple attempts: ${fallbackError.message}`);
      }
    }
  }

  static preloadCache = new Map();
  static performanceTracker = new Map();

  static async generateNextPracticeBatch({ 
    type, 
    params, 
    setCount = 1, 
    performanceData = null,
    isPreload = false 
  }) {
    const cacheKey = `${type}_${JSON.stringify(params)}_${setCount}`;
    
    if (isPreload) {
      console.log(`PRACTICE: Preloading batch ${setCount}...`);
    }

    const isAdaptive = performanceData && Object.keys(performanceData).length > 0;
    
    try {
      const questions = type === 'programming'
        ? await this.generateProgrammingQuestions({
            mainTopic: params.mainTopic,
            programmingLanguage: params.programmingLanguage,
            subTopic: params.subTopic,
            count: 10,
            setCount,
            mode: 'practice',
            categoryId: params.categoryId,
            subcategory: params.subcategory,
            topic: params.topic,
            performanceData
          })
        : await this.generateAcademicQuestions({
            college: params.college,
            department: params.department,
            semester: params.semester,
            subject: params.subject,
            unit: params.unit,
            count: 10,
            setCount,
            mode: 'practice',
            performanceData
          });

      const validQuestions = this.validateQuestions(questions);
      
      if (isAdaptive) {
        validQuestions.forEach(question => {
          question.is_adaptive = true;
          question.generated_from_performance = true;
        });
      }

      if (isPreload) {
        this.preloadCache.set(cacheKey, {
          questions: validQuestions,
          timestamp: Date.now(),
          isAdaptive
        });
        console.log(`PRACTICE: Preloaded ${validQuestions.length} ${isAdaptive ? 'adaptive' : 'standard'} questions for batch ${setCount}`);
      }

      return validQuestions;
    } catch (error) {
      console.error(`Error generating practice batch ${setCount}:`, error);
      throw error;
    }
  }

  static getPreloadedBatch(type, params, setCount) {
    const cacheKey = `${type}_${JSON.stringify(params)}_${setCount}`;
    const cached = this.preloadCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < 300000) {
      this.preloadCache.delete(cacheKey);
      console.log(`PRACTICE: Using preloaded ${cached.isAdaptive ? 'adaptive' : 'standard'} batch with ${cached.questions.length} questions`);
      return cached.questions;
    }
    
    return null;
  }

  static analyzePerformanceForAdaptive(performanceData) {
    if (!performanceData || performanceData.length < 7) {
      return {};
    }

    const recentPerformance = performanceData.slice(-10);
    
    const topicAnalysis = {};
    const difficultyAnalysis = {};
    const recentTimes = [];
    let correctCount = 0;

    recentPerformance.forEach(data => {
      const topic = data.topic || 'General';
      const difficulty = data.difficulty || 'Medium';
      const isCorrect = data.isCorrect || false;
      const timeSpent = data.timeSpent || 30;

      if (isCorrect) correctCount++;
      recentTimes.push(timeSpent);

      if (!topicAnalysis[topic]) {
        topicAnalysis[topic] = {
          total: 0,
          correct: 0,
          totalTime: 0,
          questions: []
        };
      }
      topicAnalysis[topic].total += 1;
      if (isCorrect) topicAnalysis[topic].correct += 1;
      topicAnalysis[topic].totalTime += timeSpent;
      topicAnalysis[topic].questions.push(data);

      if (!difficultyAnalysis[difficulty]) {
        difficultyAnalysis[difficulty] = {
          total: 0,
          correct: 0,
          totalTime: 0
        };
      }
      difficultyAnalysis[difficulty].total += 1;
      if (isCorrect) difficultyAnalysis[difficulty].correct += 1;
      difficultyAnalysis[difficulty].totalTime += timeSpent;
    });

    Object.keys(topicAnalysis).forEach(key => {
      const analysis = topicAnalysis[key];
      analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0;
      analysis.averageTime = analysis.total > 0 ? analysis.totalTime / analysis.total : 30;
    });

    Object.keys(difficultyAnalysis).forEach(key => {
      const analysis = difficultyAnalysis[key];
      analysis.accuracy = analysis.total > 0 ? (analysis.correct / analysis.total) * 100 : 0;
      analysis.averageTime = analysis.total > 0 ? analysis.totalTime / analysis.total : 30;
    });

    const overallAccuracy = recentPerformance.length > 0 ? (correctCount / recentPerformance.length) * 100 : 0;
    const averageTime = recentTimes.length > 0 ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length : 30;

    const weakTopics = Object.keys(topicAnalysis)
      .filter(topic => topicAnalysis[topic].accuracy < 60)
      .sort((a, b) => topicAnalysis[a].accuracy - topicAnalysis[b].accuracy);

    const strongTopics = Object.keys(topicAnalysis)
      .filter(topic => topicAnalysis[topic].accuracy >= 80)
      .sort((a, b) => topicAnalysis[b].accuracy - topicAnalysis[a].accuracy);

    const analysis = `Recent performance analysis:
- Overall accuracy: ${overallAccuracy.toFixed(1)}%
- Average response time: ${averageTime.toFixed(1)}s
- Weak areas needing focus: ${weakTopics.join(', ') || 'None identified'}
- Strong areas to challenge: ${strongTopics.join(', ') || 'None identified'}
- Topic performance distribution: ${Object.keys(topicAnalysis).map(t => `${t}: ${topicAnalysis[t].accuracy.toFixed(1)}%`).join(', ')}`;

    const recommendedDifficulty = overallAccuracy > 80 ? 'Hard' : overallAccuracy > 60 ? 'Medium' : 'Easy';

    return {
      analysis,
      topicAnalysis,
      difficultyAnalysis,
      weakTopics,
      strongTopics,
      overallAccuracy,
      averageTime,
      recommendedDifficulty,
      recentPerformance
    };
  }

  static shouldTriggerAdaptiveGeneration(totalQuestions) {
    return totalQuestions > 0 && totalQuestions % 10 === 8;
  }

  static extractTopicFromQuestion(question) {
    if (question.topic) return question.topic;
    
    const questionText = question.question.toLowerCase();
    
    const topicKeywords = {
      'variables': ['variable', 'int', 'float', 'double', 'char', 'string', 'declaration'],
      'functions': ['function', 'return', 'parameter', 'argument', 'void', 'main'],
      'loops': ['for', 'while', 'do-while', 'loop', 'iteration', 'break', 'continue'],
      'conditionals': ['if', 'else', 'switch', 'case', 'condition', 'boolean'],
      'arrays': ['array', 'index', 'element', 'subscript', 'dimension'],
      'pointers': ['pointer', 'address', 'dereference', 'memory', 'malloc', 'free'],
      'classes': ['class', 'object', 'constructor', 'destructor', 'inheritance'],
      'operators': ['operator', 'arithmetic', 'logical', 'comparison', 'bitwise'],
      'data_structures': ['struct', 'union', 'enum', 'typedef'],
      'io': ['input', 'output', 'printf', 'scanf', 'cout', 'cin', 'stream'],
      'memory': ['memory', 'heap', 'stack', 'allocation', 'deallocation'],
      'strings': ['string', 'char array', 'strlen', 'strcpy', 'strcat'],
      'recursion': ['recursive', 'recursion', 'base case', 'recursive call'],
      'preprocessor': ['#include', '#define', 'macro', 'preprocessor']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => questionText.includes(keyword))) {
        return topic.replace('_', ' ');
      }
    }

    return 'General';
  }

  static clearPreloadCache() {
    this.preloadCache.clear();
  }

  static clearPerformanceTracker() {
    this.performanceTracker.clear();
  }

  static async generateAdaptiveTestQuestions({ type, params, count = 12, performanceData }) {
    return type === 'programming'
      ? await this.generateProgrammingQuestions({
          mainTopic: params.mainTopic,
          programmingLanguage: params.programmingLanguage,
          subTopic: params.subTopic,
          count,
          setCount: 1,
          mode: 'test',
          categoryId: params.categoryId,
          subcategory: params.subcategory,
          topic: params.topic,
          performanceData
        })
      : await this.generateAcademicQuestions({
          college: params.college,
          department: params.department,
          semester: params.semester,
          subject: params.subject,
          unit: params.unit,
          count,
          setCount: 1,
          mode: 'test',
          performanceData
        });
  }

  static clearTemplateCache() {
    this.templateCache.clear();
  }

  static async checkServerHealth(endpoint) {
    try {
      const healthEndpoint = endpoint
        .replace('/generate-questions', '/health')
        .replace('/quiz', '/health');
      
      const response = await fetch(healthEndpoint);
      return response.ok;
    } catch {
      return false;
    }
  }

  static async getUserDataForQuiz() {
    try {
      const phoneNumber = localStorage.getItem('phone_number') || '';
      return {
        phone_number: phoneNumber,
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        phone_number: 'unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  static isValidQuestion(question) {
    const requiredFields = ['question', 'options', 'correct_answer', 'explanation', 'difficulty', 'hint'];
    
    for (const field of requiredFields) {
      if (!question.hasOwnProperty(field)) {
        return false;
      }
    }
    
    return Array.isArray(question.options) && 
           question.options.length === 4 && 
           question.options.includes(question.correct_answer);
  }

  static validateQuestions(questions) {
    return questions.filter(q => this.isValidQuestion(q));
  }
}

export default QuizService;