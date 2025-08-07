import { useState, useEffect, useCallback, useRef } from 'react';
import QuizService from '../services/QuizService';

export const useInfinitePractice = ({ type, params, initialQuestions, onError }) => {
  const [currentBatch, setCurrentBatch] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false);
  const [isPreloadingNext, setIsPreloadingNext] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  
  const nextBatchRef = useRef(null);
  const preloadTimeoutRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());
  const isDisposedRef = useRef(false);

  const currentQuestion = currentBatch[currentQuestionIndex] || null;

  const initializePractice = useCallback(() => {
    if (!initialQuestions || initialQuestions.length === 0) {
      onError?.('No initial questions provided');
      return;
    }

    setCurrentBatch([...initialQuestions]);
    setCurrentQuestionIndex(0);
    setCurrentBatchIndex(0);
    questionStartTimeRef.current = Date.now();

    console.log(`PRACTICE: Initialized with ${initialQuestions.length} questions in first batch`);

    preloadTimeoutRef.current = setTimeout(() => {
      if (!isDisposedRef.current) {
        preloadNextBatch();
      }
    }, 5000);
  }, [initialQuestions, onError]);

  const analyzePerformanceForAdaptive = useCallback(() => {
    if (performanceData.length < 7) return {};
    return QuizService.analyzePerformanceForAdaptive(performanceData);
  }, [performanceData]);

  const preloadNextBatch = useCallback(async () => {
    if (isDisposedRef.current || isPreloadingNext || nextBatchRef.current !== null) {
      return;
    }

    setIsPreloadingNext(true);

    try {
      console.log('PRACTICE: Preloading next batch...');

      let performanceAnalysis = {};
      let isAdaptive = false;

      if (performanceData.length >= 7) {
        performanceAnalysis = analyzePerformanceForAdaptive();
        isAdaptive = true;
        console.log('PRACTICE: Sending performance data for adaptive generation');
        console.log(`Performance summary: ${performanceAnalysis.overallAccuracy}% accuracy, ${performanceAnalysis.averageTime}s avg time`);
        console.log('Weak topics:', performanceAnalysis.weakTopics);
        console.log('Strong topics:', performanceAnalysis.strongTopics);
      }

      const nextBatch = await QuizService.generateNextPracticeBatch({
        type,
        params,
        setCount: currentBatchIndex + 1,
        performanceData: performanceAnalysis,
        isPreload: true
      });

      if (!isDisposedRef.current) {
        const validQuestions = QuizService.validateQuestions(nextBatch);
        nextBatchRef.current = validQuestions;
        console.log(`PRACTICE: Preloaded ${validQuestions.length} ${isAdaptive ? 'adaptive' : 'standard'} questions for next batch`);
      }
    } catch (error) {
      console.error('PRACTICE: Error preloading next batch:', error);
    } finally {
      if (!isDisposedRef.current) {
        setIsPreloadingNext(false);
      }
    }
  }, [type, params, currentBatchIndex, performanceData, isPreloadingNext, analyzePerformanceForAdaptive]);

  const loadNextBatch = useCallback(async () => {
    if (isDisposedRef.current) return;

    setIsLoadingNextBatch(true);

    try {
      let nextBatch;
      let isAdaptiveBatch = false;

      if (nextBatchRef.current && nextBatchRef.current.length > 0) {
        nextBatch = nextBatchRef.current;
        nextBatchRef.current = null;
        isAdaptiveBatch = performanceData.length >= 7;
        console.log(`PRACTICE: Using preloaded ${isAdaptiveBatch ? 'adaptive' : 'standard'} batch with ${nextBatch.length} questions`);
      } else {
        console.log('PRACTICE: Generating new batch on demand...');

        let performanceAnalysis = {};
        if (performanceData.length >= 7) {
          performanceAnalysis = analyzePerformanceForAdaptive();
          isAdaptiveBatch = true;
        }

        nextBatch = await QuizService.generateNextPracticeBatch({
          type,
          params,
          setCount: currentBatchIndex + 1,
          performanceData: performanceAnalysis
        });
        nextBatch = QuizService.validateQuestions(nextBatch);
      }

      if (nextBatch.length === 0) {
        throw new Error('No valid questions in next batch');
      }

      if (!isDisposedRef.current) {
        setCurrentBatch(nextBatch);
        setCurrentQuestionIndex(0);
        setCurrentBatchIndex(prev => prev + 1);
        setIsLoadingNextBatch(false);
        questionStartTimeRef.current = Date.now();

        setTimeout(() => {
          if (!isDisposedRef.current) {
            preloadNextBatch();
          }
        }, 3000);

        if (isAdaptiveBatch) {
          onAdaptiveNotification?.();
        }
      }
    } catch (error) {
      console.error('Error loading next batch:', error);
      if (!isDisposedRef.current) {
        setIsLoadingNextBatch(false);
        onError?.(`Failed to load next batch: ${error.message}`);
      }
    }
  }, [type, params, currentBatchIndex, performanceData, preloadNextBatch, analyzePerformanceForAdaptive]);

  const selectAnswer = useCallback(async (answer) => {
    if (isDisposedRef.current || !currentQuestion) return;

    const questionStartTime = questionStartTimeRef.current;
    const answerTime = Date.now();
    const timeSpent = Math.round((answerTime - questionStartTime) / 1000);
    const isCorrect = answer === currentQuestion.correct_answer;

    const topic = QuizService.extractTopicFromQuestion(currentQuestion);
    const difficulty = currentQuestion.difficulty || 'Medium';

    const performanceEntry = {
      questionIndex: totalQuestions,
      topic,
      difficulty,
      isCorrect,
      timeSpent,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      timestamp: new Date().toISOString(),
      question: currentQuestion.question,
      questionType: currentQuestion.is_adaptive ? 'adaptive' : 'standard',
      batchIndex: currentBatchIndex
    };

    setPerformanceData(prev => [...prev, performanceEntry]);
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers?.(prev => prev + 1);
      setTotalXP?.(prev => prev + 2);
    }

    return { isCorrect, timeSpent, topic, difficulty };
  }, [currentQuestion, totalQuestions, currentBatchIndex]);

  const nextQuestion = useCallback(async () => {
    if (isDisposedRef.current) return;

    if (currentQuestionIndex >= currentBatch.length - 1) {
      await loadNextBatch();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      questionStartTimeRef.current = Date.now();
    }
  }, [currentQuestionIndex, currentBatch.length, loadNextBatch]);

  const skipQuestion = useCallback(async () => {
    if (isDisposedRef.current || !currentQuestion) return;

    const questionStartTime = questionStartTimeRef.current;
    const answerTime = Date.now();
    const timeSpent = Math.round((answerTime - questionStartTime) / 1000);

    const topic = QuizService.extractTopicFromQuestion(currentQuestion);
    const difficulty = currentQuestion.difficulty || 'Medium';

    const performanceEntry = {
      questionIndex: totalQuestions,
      topic,
      difficulty,
      isCorrect: false,
      timeSpent,
      selectedAnswer: null,
      correctAnswer: currentQuestion.correct_answer,
      timestamp: new Date().toISOString(),
      question: currentQuestion.question,
      skipped: true,
      questionType: currentQuestion.is_adaptive ? 'adaptive' : 'standard',
      batchIndex: currentBatchIndex
    };

    setPerformanceData(prev => [...prev, performanceEntry]);
    setTotalQuestions(prev => prev + 1);

    await nextQuestion();
  }, [currentQuestion, totalQuestions, currentBatchIndex, nextQuestion]);

  const retryLoadBatch = useCallback(async () => {
    if (isDisposedRef.current) return;

    setIsLoadingNextBatch(true);
    nextBatchRef.current = null;

    try {
      let performanceAnalysis = {};
      if (performanceData.length >= 7) {
        performanceAnalysis = analyzePerformanceForAdaptive();
      }

      const nextBatch = await QuizService.generateNextPracticeBatch({
        type,
        params,
        setCount: currentBatchIndex + 1,
        performanceData: performanceAnalysis
      });

      const validatedBatch = QuizService.validateQuestions(nextBatch);

      if (validatedBatch.length === 0) {
        throw new Error('No valid questions generated');
      }

      if (!isDisposedRef.current) {
        setCurrentBatch(validatedBatch);
        setCurrentQuestionIndex(0);
        setCurrentBatchIndex(prev => prev + 1);
        setIsLoadingNextBatch(false);
        questionStartTimeRef.current = Date.now();

        setTimeout(() => {
          if (!isDisposedRef.current) {
            preloadNextBatch();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error retrying batch load:', error);
      if (!isDisposedRef.current) {
        setIsLoadingNextBatch(false);
        onError?.(`Failed to load questions after retry: ${error.message}`);
      }
    }
  }, [type, params, currentBatchIndex, performanceData, preloadNextBatch, analyzePerformanceForAdaptive]);

  const shouldTriggerAdaptiveGeneration = useCallback(() => {
    return QuizService.shouldTriggerAdaptiveGeneration(totalQuestions);
  }, [totalQuestions]);

  const triggerAdaptiveGeneration = useCallback(() => {
    if (isDisposedRef.current) return;
    nextBatchRef.current = null;
    preloadNextBatch();
  }, [preloadNextBatch]);

  const dispose = useCallback(() => {
    isDisposedRef.current = true;
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    QuizService.clearPreloadCache();
  }, []);

  useEffect(() => {
    initializePractice();
    return dispose;
  }, [initializePractice, dispose]);

  useEffect(() => {
    if (shouldTriggerAdaptiveGeneration()) {
      console.log('PRACTICE: Triggering adaptive generation at question', totalQuestions);
      triggerAdaptiveGeneration();
    }
  }, [totalQuestions, shouldTriggerAdaptiveGeneration, triggerAdaptiveGeneration]);

  return {
    currentQuestion,
    currentQuestionIndex,
    currentBatchIndex,
    totalQuestions,
    performanceData,
    isLoadingNextBatch,
    isPreloadingNext,
    selectAnswer,
    skipQuestion,
    nextQuestion,
    retryLoadBatch,
    shouldTriggerAdaptiveGeneration: shouldTriggerAdaptiveGeneration(),
    hasMoreQuestions: true, // Always true for infinite mode
    dispose
  };
};

export default useInfinitePractice;