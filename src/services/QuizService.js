class QuizService {
  static _programmingEndpoint = 'https://prepbackend.onesite.store/prep/generate-questions';
  static _academicEndpoint = 'https://prepbackend.onesite.store/quiz';
  
  static requestInProgress = new Map();
  static preloadCache = new Map();
  static performanceTracker = new Map();

  static async generatePracticeQuestions({ type, params }) {
    const requestKey = `practice_${type}_${JSON.stringify(params)}`;
    
    if (this.requestInProgress.has(requestKey)) {
      console.log('Practice generation already in progress, waiting...');
      return await this.requestInProgress.get(requestKey);
    }

    const requestPromise = this._executePracticeQuestionGeneration({ type, params });
    this.requestInProgress.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestInProgress.delete(requestKey);
    }
  }

  static async generateTestQuestions({ type, params }) {
    const requestKey = `test_${type}_${JSON.stringify(params)}`;
    
    if (this.requestInProgress.has(requestKey)) {
      console.log('Test generation already in progress, waiting...');
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

  static async generateNextPracticeBatch({ type, params, setCount = 1, performanceData = null, isPreload = false }) {
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

  static shouldTriggerAdaptiveGeneration(totalQuestions) {
    return (totalQuestions % 10 === 8);
  }

  static clearPreloadCache() {
    this.preloadCache.clear();
  }

  static async _executePracticeQuestionGeneration({ type, params }) {
    try {
      console.log('Executing practice question generation...');
      
      const questions = type === 'programming'
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

      return this.validateQuestions(questions);
    } catch (error) {
      console.error('Practice generation failed:', error);
      throw error;
    }
  }

  static async _executeTestQuestionGeneration({ type, params }) {
    try {
      console.log('Executing test question generation...');
      
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
      console.log(`Generated ${validQuestions.length} valid questions for test mode`);
      
      return validQuestions;
    } catch (error) {
      console.error('Test generation failed:', error);
      throw error;
    }
  }

  static async generateProgrammingQuestions({
    mainTopic,
    programmingLanguage,
    subTopic,
    count = 10,
    setCount = 0,
    mode = 'practice',
    categoryId,
    subcategory,
    topic,
    performanceData = null
  }) {
    try {
      const requestBody = {
        mainTopic,
        programmingLanguage,
        subTopic,
        count,
        setCount,
        mode,
        categoryId,
        subcategory,
        topic,
        performanceData: performanceData || {}
      };

      console.log(`Generating ${count} ${mode} questions for ${programmingLanguage} - ${subTopic}`);
      if (performanceData) {
        console.log('Using adaptive generation with performance data');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(this._programmingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (Array.isArray(data)) {
        console.log(`Successfully parsed ${data.length} questions from array response`);
        return data;
      } else if (data.questions && Array.isArray(data.questions)) {
        console.log(`Successfully parsed ${data.questions.length} questions from object response`);
        return data.questions;
      } else if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        const content = data.files[0].content;
        const parsed = JSON.parse(content);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          console.log(`Successfully parsed ${parsed.questions.length} questions from file response`);
          return parsed.questions;
        }
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format: no questions array found');
      }

      return [];
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      console.error('Error generating programming questions:', error);
      throw error;
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
    mode = 'practice',
    performanceData = null
  }) {
    try {
      const requestBody = {
        college,
        department,
        semester,
        subject,
        unit,
        count,
        setCount,
        mode,
        performanceData: performanceData || {}
      };

      console.log(`Generating ${count} ${mode} questions for ${subject} - ${unit}`);
      if (performanceData) {
        console.log('Using adaptive generation with performance data');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(this._academicEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (Array.isArray(data)) {
        console.log(`Successfully parsed ${data.length} questions from array response`);
        return data;
      } else if (data.questions && Array.isArray(data.questions)) {
        console.log(`Successfully parsed ${data.questions.length} questions from object response`);
        return data.questions;
      } else if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        const content = data.files[0].content;
        const parsed = JSON.parse(content);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          console.log(`Successfully parsed ${parsed.questions.length} questions from file response`);
          return parsed.questions;
        }
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format: no questions array found');
      }

      return [];
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      console.error('Error generating academic questions:', error);
      throw error;
    }
  }

  static normalizeQuestion(question) {
    if (!question || typeof question !== 'object') {
      return null;
    }

    const normalized = { ...question };

    if (!Array.isArray(normalized.options) || normalized.options.length === 0) {
      console.warn('Question has invalid options:', normalized.options);
      return null;
    }

    if (!normalized.correct_answer) {
      console.warn('Question missing correct_answer:', normalized);
      return null;
    }

    const validAnswerLetters = ['A', 'B', 'C', 'D'];
    
    if (!validAnswerLetters.includes(normalized.correct_answer)) {
      const correctAnswerText = normalized.correct_answer;
      
      const matchingOptionIndex = normalized.options.findIndex(option => {
        if (typeof option === 'string' && typeof correctAnswerText === 'string') {
          return option.trim().toLowerCase() === correctAnswerText.trim().toLowerCase() ||
                 option.trim().includes(correctAnswerText.trim()) ||
                 correctAnswerText.trim().includes(option.trim());
        }
        return false;
      });

      if (matchingOptionIndex !== -1 && matchingOptionIndex < validAnswerLetters.length) {
        normalized.correct_answer = validAnswerLetters[matchingOptionIndex];
        console.log(`Normalized correct_answer from "${correctAnswerText}" to "${normalized.correct_answer}"`);
      } else {
        console.warn(`Could not find matching option for correct_answer: "${correctAnswerText}"`);
        console.warn('Available options:', normalized.options);
        return null;
      }
    }

    while (normalized.options.length < 4) {
      normalized.options.push(`Option ${String.fromCharCode(65 + normalized.options.length)}`);
    }

    if (normalized.options.length > 4) {
      normalized.options = normalized.options.slice(0, 4);
    }

    if (!normalized.explanation) {
      normalized.explanation = "Explanation not provided.";
    }

    if (!normalized.hint) {
      normalized.hint = "Consider the key concepts related to this topic.";
    }

    if (!normalized.difficulty) {
      normalized.difficulty = "Medium";
    }

    return normalized;
  }

  static validateQuestions(questions) {
    if (!Array.isArray(questions)) {
      console.warn('Questions is not an array:', questions);
      return [];
    }

    const validQuestions = questions
      .map(question => this.normalizeQuestion(question))
      .filter(question => {
        if (!question) {
          return false;
        }

        const requiredFields = ['question', 'options', 'correct_answer'];
        const missingFields = requiredFields.filter(field => !question[field]);
        
        if (missingFields.length > 0) {
          console.warn(`Question missing required fields: ${missingFields.join(', ')}`, question);
          return false;
        }

        if (!Array.isArray(question.options) || question.options.length < 2) {
          console.warn('Question options invalid:', question.options);
          return false;
        }

        const validAnswers = ['A', 'B', 'C', 'D'];
        if (!validAnswers.includes(question.correct_answer)) {
          console.warn('Invalid correct_answer after normalization:', question.correct_answer);
          return false;
        }

        return true;
      });

    console.log(`Validated ${validQuestions.length}/${questions.length} questions`);
    return validQuestions;
  }

  static clearAllRequests() {
    this.requestInProgress.clear();
    this.preloadCache.clear();
  }
}

export default QuizService;