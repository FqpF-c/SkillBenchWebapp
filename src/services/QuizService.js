class QuizService {
    static PROGRAMMING_ENDPOINT = 'https://prepbackend.onesite.store/prep/generate-questions';
    static ACADEMIC_ENDPOINT = 'https://prepbackend.onesite.store/quiz';
    
    static templateCache = {};
    
    static FALLBACK_TEMPLATES = {
      'programming_practice': `
  Generate {count} multiple-choice questions about {programmingLanguage} focusing on {subTopic}.
  
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
  
  Focus on: {mainTopic} - {subTopic} in {programmingLanguage}
      `,
      'programming_test': `
  Generate {count} multiple-choice test questions about {programmingLanguage} focusing on {subTopic}.
  
  Requirements:
  - Questions should test comprehensive understanding
  - Mix of theoretical and practical questions
  - Progressive difficulty (easy to hard)
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
  
  Focus on: {mainTopic} - {subTopic} in {programmingLanguage}
      `
    };
  
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
            topic: params.topic,
          })
        : await this.generateAcademicQuestions({
            college: params.college,
            department: params.department,
            semester: params.semester,
            subject: params.subject,
            unit: params.unit,
            count: 10,
            setCount: 0,
            mode: 'practice',
          });
    }
  
    static async generateTestQuestions({ type, params }) {
      const allQuestions = [];
  
      const firstSet = type === 'programming'
        ? await this.generateProgrammingQuestions({
            mainTopic: params.mainTopic,
            programmingLanguage: params.programmingLanguage,
            subTopic: params.subTopic,
            count: 10,
            setCount: 0,
            mode: 'test',
            categoryId: params.categoryId,
            subcategory: params.subcategory,
            topic: params.topic,
          })
        : await this.generateAcademicQuestions({
            college: params.college,
            department: params.department,
            semester: params.semester,
            subject: params.subject,
            unit: params.unit,
            count: 10,
            setCount: 0,
            mode: 'test',
          });
  
      allQuestions.push(...this.validateQuestions(firstSet));
  
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      const secondSet = type === 'programming'
        ? await this.generateProgrammingQuestions({
            mainTopic: params.mainTopic,
            programmingLanguage: params.programmingLanguage,
            subTopic: params.subTopic,
            count: 10,
            setCount: 1,
            mode: 'test',
            categoryId: params.categoryId,
            subcategory: params.subcategory,
            topic: params.topic,
          })
        : await this.generateAcademicQuestions({
            college: params.college,
            department: params.department,
            semester: params.semester,
            subject: params.subject,
            unit: params.unit,
            count: 10,
            setCount: 1,
            mode: 'test',
          });
  
      allQuestions.push(...this.validateQuestions(secondSet));
      return allQuestions;
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
      const templateParams = {
        mainTopic,
        programmingLanguage,
        subTopic,
        categoryId,
        subcategory,
        topic
      };
  
      const isAdaptive = performanceData && Object.keys(performanceData).length > 0;
  
      const baseTemplate = await this.getPromptTemplate({
        type: 'programming',
        mode,
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
        categoryId,
        subcategory,
        topic
      };
  
      try {
        const response = await fetch(this.PROGRAMMING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          
          // Handle different response formats
          let questions = [];
          
          if (data.files && data.files.length > 0) {
            // Format 1: Response with files array
            const content = data.files[0].content;
            const parsed = JSON.parse(content);
            questions = parsed.questions || [];
          } else if (data.questions && Array.isArray(data.questions)) {
            // Format 2: Direct questions array
            questions = data.questions;
          } else if (data.content) {
            // Format 3: Content field with JSON
            const parsed = JSON.parse(data.content);
            questions = parsed.questions || [];
          } else if (Array.isArray(data)) {
            // Format 4: Direct array response
            questions = data;
          } else {
            console.error('Unexpected response format:', data);
            throw new Error('Invalid response format - no questions found');
          }
          
          if (isAdaptive) {
            questions = questions.map(q => ({
              ...q,
              is_adaptive: true,
              generated_from_performance: true
            }));
          }
          
          return questions;
        } else {
          const error = await response.json();
          throw new Error(`Server error: ${error.error || 'Unknown'}`);
        }
      } catch (error) {
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
  
      try {
        const response = await fetch(this.ACADEMIC_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Academic API Response:', data); // Debug log
          
          // Handle different response formats
          let questions = [];
          
          if (data.files && data.files.length > 0) {
            // Format 1: Response with files array
            const content = data.files[0].content;
            const parsed = JSON.parse(content);
            questions = parsed.questions || [];
          } else if (data.questions && Array.isArray(data.questions)) {
            // Format 2: Direct questions array
            questions = data.questions;
          } else if (data.content) {
            // Format 3: Content field with JSON
            const parsed = JSON.parse(data.content);
            questions = parsed.questions || [];
          } else if (Array.isArray(data)) {
            // Format 4: Direct array response
            questions = data;
          } else {
            console.error('Unexpected response format:', data);
            throw new Error('Invalid response format - no questions found');
          }
          
          if (isAdaptive) {
            questions = questions.map(q => ({
              ...q,
              is_adaptive: true,
              generated_from_performance: true
            }));
          }
          
          return questions;
        } else {
          const error = await response.json();
          throw new Error(`Server error: ${error.error || 'Unknown'}`);
        }
      } catch (error) {
        console.error('Error generating academic questions:', error);
        throw error;
      }
    }
  
    static async getPromptTemplate({ type, mode, isAdaptive = false }) {
      const key = `${type}_${mode}${isAdaptive ? '_adaptive' : ''}`;
      
      if (this.templateCache[key]) {
        return this.templateCache[key];
      }
  
      return this.FALLBACK_TEMPLATES[key] || this.FALLBACK_TEMPLATES[`${type}_${mode}`] || this.FALLBACK_TEMPLATES[`${type}_practice`];
    }
  
    static fillPromptTemplate({ template, params, count, performanceData }) {
      let filled = template.replace('{count}', count.toString());
      
      Object.keys(params).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        filled = filled.replace(regex, params[key] || 'Unknown');
      });
  
      if (performanceData) {
        filled = filled.replace('{performanceAnalysis}', performanceData.analysis || 'No performance data available');
        filled = filled.replace('{weakTopics}', (performanceData.weakTopics || []).join(', ') || 'None identified');
        filled = filled.replace('{strongTopics}', (performanceData.strongTopics || []).join(', ') || 'None identified');
        filled = filled.replace('{overallAccuracy}', (performanceData.overallAccuracy || 0).toString());
        filled = filled.replace('{averageTime}', (performanceData.averageTime || 30).toString());
        filled = filled.replace('{recommendedDifficulty}', performanceData.recommendedDifficulty || 'Medium');
      }
      
      return filled;
    }
  
    static validateQuestions(questions) {
      return questions.filter(q => this.isValidQuestion(q));
    }
  
    static isValidQuestion(question) {
      const requiredFields = ['question', 'options', 'correct_answer', 'explanation', 'difficulty', 'hint'];
      
      for (const field of requiredFields) {
        if (!question.hasOwnProperty(field)) return false;
      }
      
      return (
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.includes(question.correct_answer)
      );
    }
  
    static async generateNextPracticeBatch({ type, params, setCount = 1, performanceData = null }) {
      return type === 'programming'
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
  }
  
  export default QuizService;