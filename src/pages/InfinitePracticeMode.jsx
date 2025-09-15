import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizService from '../services/QuizService';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Zap, 
  SkipForward, 
  CheckCircle, 
  XCircle, 
  Brain,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Maximize2,
  Share2,
  TrendingUp,
  Award,
  Activity,
  Menu,
  X
} from 'lucide-react';

const InfinitePracticeMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserStats } = useAuth();
  
  const { questions, topicName, subtopicName, type, quizParams } = location.state || {};

  // Animation states
  const [hasEntryAnimationPlayed, setHasEntryAnimationPlayed] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Core infinite system states
  const [currentBatch, setCurrentBatch] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(1);
  const [nextBatch, setNextBatch] = useState(null);
  const [isPreloadingNext, setIsPreloadingNext] = useState(false);
  const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false);
  const [isWaitingForBatch, setIsWaitingForBatch] = useState(false);

  // Question states
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(Date.now());

  // Progress tracking
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  // UI states
  const [sessionId, setSessionId] = useState(null);
  const [showAdaptiveNotification, setShowAdaptiveNotification] = useState(false);
  const [accessibilityTextSize, setAccessibilityTextSize] = useState('normal');
  const [topicTimings, setTopicTimings] = useState({});
  const [topicAccuracy, setTopicAccuracy] = useState({});
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isDisposedRef = useRef(false);
  const hasInitialized = useRef(false);
  const nextBatchRef = useRef(null);
  const abortControllerRef = useRef(null);

  const currentQuestion = currentBatch[currentQuestionIndex] || null;

  // Entry animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => setHasEntryAnimationPlayed(true), 500);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Cleanup function - defined early to avoid hoisting issues
  const cleanup = useCallback(() => {
    console.log('🧹 INFINITE PRACTICE: Cleaning up resources...');
    isDisposedRef.current = true;
    
    // Cancel any ongoing question generation
    if (abortControllerRef.current) {
      console.log('🚫 INFINITE PRACTICE: Cancelling ongoing question generation...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear any pending timeouts or intervals
    // (React will handle this automatically for most cases)
  }, []);

  // Handle page unload/refresh/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🚪 INFINITE PRACTICE: Page unloading, cleaning up...');
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cleanup]);

  useEffect(() => {
    if (!questions || !type || !quizParams) {
      navigate(-1);
      return;
    }

    isDisposedRef.current = false;
    initializeWithProvidedQuestions();
    
    return () => {
      console.log('🚫 INFINITE PRACTICE: Component unmounting, cleaning up...');
      isDisposedRef.current = true;
      
      // Cancel any ongoing question generation
      if (abortControllerRef.current) {
        console.log('🚫 INFINITE PRACTICE: Aborting ongoing question generation...');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const initializeWithProvidedQuestions = () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🚀 INFINITE PRACTICE: Initializing with provided questions');
    
    setSessionId(`infinite_practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    const validatedQuestions = QuizService.validateQuestions(questions);
    
    if (validatedQuestions.length > 0) {
      setCurrentBatch(validatedQuestions);
      setCurrentQuestionIndex(0);
      setCurrentBatchIndex(1);
      setCurrentQuestionStartTime(Date.now());
      
      console.log(`✅ INFINITE PRACTICE: Started with Batch 1 containing ${validatedQuestions.length} questions`);
    } else {
      console.error('❌ INFINITE PRACTICE: No valid questions available');
      navigate(-1);
    }
  };

  const generateBatch = async (batchNumber, performanceAnalysis = null) => {
    console.log(`🔄 INFINITE PRACTICE: Starting API call for Batch ${batchNumber}...`);
    console.log(`📋 INFINITE PRACTICE: Using same params as initial load:`, { type, quizParams });
    
    // Create new abort controller for this generation request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const isAdaptive = performanceAnalysis && Object.keys(performanceAnalysis).length > 0;
    if (isAdaptive) {
      console.log('🧠 INFINITE PRACTICE: Using adaptive generation based on performance');
      console.log('📊 INFINITE PRACTICE: Performance data:', performanceAnalysis);
    }

    try {
      // Check if component was disposed before starting
      if (isDisposedRef.current) {
        console.log('🚫 INFINITE PRACTICE: Component disposed, cancelling batch generation');
        throw new Error('Component disposed');
      }
      
      console.log('📡 INFINITE PRACTICE: Making API call to generate questions...');
      
      let questions;
      if (type === 'programming') {
        console.log('🔧 INFINITE PRACTICE: Calling generateProgrammingQuestions...');
        questions = await QuizService.generatePracticeQuestions({
          type,
          params: {
            mainTopic: quizParams.mainTopic,
            programmingLanguage: quizParams.programmingLanguage,
            subTopic: quizParams.subTopic,
            categoryId: quizParams.categoryId,
            subcategory: quizParams.subcategory,
            topic: quizParams.topic
          },
          count: 10,
          setCount: batchNumber,
          mode: 'practice',
          performanceData: performanceAnalysis,
          signal: abortController.signal // Add abort signal
        });
      } else {
        console.log('🎓 INFINITE PRACTICE: Calling generateAcademicQuestions...');
        questions = await QuizService.generatePracticeQuestions({
          type,
          params: quizParams,
          count: 10,
          setCount: batchNumber,
          mode: 'practice',
          performanceData: performanceAnalysis,
          signal: abortController.signal // Add abort signal
        });
      }

      console.log('📡 INFINITE PRACTICE: Raw API response received:', questions);
      console.log('📡 INFINITE PRACTICE: Questions count:', questions?.length || 0);
      
      if (!questions || !Array.isArray(questions)) {
        console.error('❌ INFINITE PRACTICE: Invalid questions format received:', questions);
        throw new Error('Invalid questions format received from API');
      }
      
      const validatedQuestions = QuizService.validateQuestions(questions);
      console.log('✅ INFINITE PRACTICE: Validated questions:', validatedQuestions.length);
      
      if (validatedQuestions.length === 0) {
        console.error('❌ INFINITE PRACTICE: No valid questions after validation');
        throw new Error('No valid questions generated');
      }
      
      if (isAdaptive && validatedQuestions.length > 0) {
        validatedQuestions.forEach(question => {
          question.is_adaptive = true;
          question.generated_from_performance = true;
          question.batch_number = batchNumber;
        });
      }

      console.log(`✅ INFINITE PRACTICE: Successfully generated ${validatedQuestions.length} questions for Batch ${batchNumber} (${isAdaptive ? 'Adaptive' : 'Standard'})`);
      return validatedQuestions;
    } catch (error) {
      // Check if this was an abort error (user left page)
      if (error.name === 'AbortError' || error.message === 'Component disposed') {
        console.log('🚫 INFINITE PRACTICE: Question generation cancelled (user left page)');
        return []; // Return empty array instead of throwing
      }
      
      console.error(`❌ INFINITE PRACTICE: API call failed for Batch ${batchNumber}:`, error);
      console.error('❌ INFINITE PRACTICE: Error details:', error.message);
      console.error('❌ INFINITE PRACTICE: Full error object:', error);
      throw error;
    } finally {
      // Clear the abort controller reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const analyzePerformanceForAdaptive = useCallback(() => {
    if (performanceData.length < 7) return null;

    let recentPerformance = [...performanceData];
    if (recentPerformance.length > 15) {
      recentPerformance = recentPerformance.slice(-15);
    }

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
        topicAnalysis[topic] = { total: 0, correct: 0, totalTime: 0 };
      }
      topicAnalysis[topic].total += 1;
      if (isCorrect) topicAnalysis[topic].correct += 1;
      topicAnalysis[topic].totalTime += timeSpent;

      if (!difficultyAnalysis[difficulty]) {
        difficultyAnalysis[difficulty] = { total: 0, correct: 0, totalTime: 0 };
      }
      difficultyAnalysis[difficulty].total += 1;
      if (isCorrect) difficultyAnalysis[difficulty].correct += 1;
      difficultyAnalysis[difficulty].totalTime += timeSpent;
    });

    Object.keys(topicAnalysis).forEach(key => {
      const value = topicAnalysis[key];
      value.accuracy = value.total > 0 ? (value.correct / value.total) * 100 : 0;
      value.averageTime = value.total > 0 ? value.totalTime / value.total : 30;
    });

    const weakTopics = Object.keys(topicAnalysis)
      .filter(topic => topicAnalysis[topic].accuracy < 65)
      .slice(0, 3);
    
    const strongTopics = Object.keys(topicAnalysis)
      .filter(topic => topicAnalysis[topic].accuracy >= 85)
      .slice(0, 2);

    const averageTime = recentTimes.length > 0 
      ? Math.round(recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length) 
      : 30;
    
    const overallAccuracy = recentPerformance.length > 0 
      ? Math.round((correctCount / recentPerformance.length) * 100) 
      : 50;

    return {
      topicAnalysis,
      difficultyAnalysis,
      weakTopics,
      strongTopics,
      averageTime,
      overallAccuracy,
      recentPerformanceCount: recentPerformance.length,
      performanceAnalysis: `Recent performance: ${overallAccuracy}% accuracy over ${recentPerformance.length} questions. Avg time: ${averageTime}s. Weak areas: ${weakTopics.join(', ') || 'None'}. Strong areas: ${strongTopics.join(', ') || 'None'}.`,
      recommendedDifficulty: overallAccuracy > 85 ? 'Hard' : overallAccuracy > 65 ? 'Medium' : 'Easy',
    };
  }, [performanceData]);

  // Preload next batch when user reaches question 3 of current batch
  useEffect(() => {
    const isAtQuestion3 = currentQuestionIndex === 2; // Question 3 (0-indexed)
    const hasBatchQuestions = currentBatch.length > 0;
    const shouldPreload = isAtQuestion3 && hasBatchQuestions;
    
    console.log('🔍 INFINITE PRACTICE: Preload trigger check:', {
      currentQuestion: currentQuestionIndex + 1,
      currentBatchIndex,
      isAtQuestion3,
      hasBatchQuestions,
      shouldPreload,
      hasNextBatch: !!nextBatch,
      nextBatchRef: !!nextBatchRef.current,
      isPreloadingNext,
      isDisposed: isDisposedRef.current
    });
    
    if (shouldPreload && !nextBatch && !nextBatchRef.current && !isPreloadingNext && !isDisposedRef.current) {
      console.log(`🎯 INFINITE PRACTICE: *** TRIGGERING PRELOAD *** - Question 3 of Batch ${currentBatchIndex}`);
      console.log(`📡 INFINITE PRACTICE: Starting API call for Batch ${currentBatchIndex + 1}`);
      
      preloadNextBatch();
    } else if (shouldPreload) {
      console.log('🚫 INFINITE PRACTICE: Preload NOT triggered because:', {
        hasNextBatch: !!nextBatch,
        hasNextBatchRef: !!nextBatchRef.current,
        isPreloadingNext,
        isDisposed: isDisposedRef.current
      });
    }
  }, [currentQuestionIndex, nextBatch, isPreloadingNext, currentBatch.length, currentBatchIndex]);

  const preloadNextBatch = async () => {
    console.log('🔍 INFINITE PRACTICE: Preload check details:', {
      disposed: isDisposedRef.current,
      alreadyPreloading: isPreloadingNext,
      nextBatchExists: !!nextBatch,
      currentBatchIndex,
      nextBatchNumber: currentBatchIndex + 1
    });

    if (isDisposedRef.current) {
      console.log('🚫 INFINITE PRACTICE: Component is disposed, skipping preload');
      return;
    }

    if (isPreloadingNext) {
      console.log('🚫 INFINITE PRACTICE: Already preloading, skipping duplicate request');
      return;
    }

    if (nextBatch) {
      console.log('🚫 INFINITE PRACTICE: Next batch already exists, skipping preload');
      return;
    }

    console.log(`🚀 INFINITE PRACTICE: STARTING PRELOAD for Batch ${currentBatchIndex + 1}`);
    setIsPreloadingNext(true);

    try {
      const nextBatchNumber = currentBatchIndex + 1;
      let performanceAnalysis = null;
      
      if (performanceData.length >= 7) {
        console.log('📊 INFINITE PRACTICE: Analyzing performance for adaptive generation...');
        performanceAnalysis = analyzePerformanceForAdaptive();
        console.log('📊 INFINITE PRACTICE: Performance analysis result:', performanceAnalysis);
      }

      console.log(`📡 INFINITE PRACTICE: MAKING API CALL for Batch ${nextBatchNumber}...`);
      const startTime = Date.now();
      const preloadedBatch = await generateBatch(nextBatchNumber, performanceAnalysis);
      const endTime = Date.now();
      
      console.log(`🕒 INFINITE PRACTICE: API call took ${endTime - startTime}ms`);
      
      // Check if batch was cancelled (empty array returned)
      if (preloadedBatch.length === 0 && isDisposedRef.current) {
        console.log('🚫 INFINITE PRACTICE: Preload was cancelled due to component disposal');
        return;
      }
      
      if (!isDisposedRef.current && preloadedBatch.length > 0) {
        setNextBatch(preloadedBatch);
        nextBatchRef.current = preloadedBatch; // Also update ref for synchronous access
        console.log(`✅ INFINITE PRACTICE: SUCCESSFULLY PRELOADED Batch ${nextBatchNumber} with ${preloadedBatch.length} questions`);
        console.log('📋 INFINITE PRACTICE: Sample question from preloaded batch:', preloadedBatch[0]?.question?.substring(0, 50) + '...');
        
        // Clear waiting state if it was active
        setIsWaitingForBatch(false);
      } else if (preloadedBatch.length === 0) {
        console.log('⚠️ INFINITE PRACTICE: Preload returned empty batch (likely cancelled)');
      } else {
        console.log('⚠️ INFINITE PRACTICE: Preload completed but component was disposed');
      }
    } catch (error) {
      // Don't log errors if the request was cancelled due to page navigation
      if (isDisposedRef.current) {
        console.log('🚫 INFINITE PRACTICE: Preload error ignored due to component disposal');
        return;
      }
      
      console.error(`❌ INFINITE PRACTICE: PRELOAD FAILED for Batch ${currentBatchIndex + 1}:`, error);
      console.error('❌ INFINITE PRACTICE: Full error:', error);
      
      // If preload fails, retry with exponential backoff
      if (!isDisposedRef.current) {
        const retryDelay = Math.min(2000 * (1 + Math.random()), 5000); // 2-5 second delay
        console.log(`🔄 INFINITE PRACTICE: Will retry preload in ${Math.round(retryDelay)}ms...`);
        setTimeout(() => {
          if (!isDisposedRef.current && !nextBatch) {
            console.log('🔄 INFINITE PRACTICE: Retrying preload after failure...');
            // Reset preloading state before retry
            setIsPreloadingNext(false);
            setTimeout(() => preloadNextBatch(), 100);
          } else {
            console.log('🚫 INFINITE PRACTICE: Retry cancelled - disposed or batch exists');
          }
        }, retryDelay);
      }
    } finally {
      if (!isDisposedRef.current) {
        setIsPreloadingNext(false);
        console.log(`🏁 INFINITE PRACTICE: Preload process completed for Batch ${currentBatchIndex + 1}`);
      }
    }
  };

  const loadNextBatch = async () => {
    // Check both state and ref
    const availableBatch = nextBatch || nextBatchRef.current;
    
    if (availableBatch && availableBatch.length > 0) {
      console.log(`🔄 INFINITE PRACTICE: LOADING NEXT BATCH - Transitioning to Batch ${currentBatchIndex + 1}`);
      console.log(`📋 INFINITE PRACTICE: New batch contains ${availableBatch.length} questions`);
      
      setCurrentBatch(availableBatch);
      setCurrentBatchIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setNextBatch(null);
      nextBatchRef.current = null; // Clear ref too
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentQuestionStartTime(Date.now());
      
      console.log(`✅ INFINITE PRACTICE: Successfully transitioned to Batch ${currentBatchIndex + 1}`);
      console.log('📋 INFINITE PRACTICE: First question in new batch:', availableBatch[0]?.question?.substring(0, 50) + '...');
    } else {
      console.log(`⏳ INFINITE PRACTICE: Next batch not ready, entering wait mode for Batch ${currentBatchIndex + 1}`);
      await waitForNextBatch();
    }
  };

  const waitForNextBatch = async () => {
    console.log(`⏳ INFINITE PRACTICE: WAITING for Batch ${currentBatchIndex + 1} to finish loading...`);
    setIsWaitingForBatch(true);
    setIsLoadingNextBatch(true);
    
    // If preload hasn't started, start it now
    if (!nextBatch && !nextBatchRef.current && !isPreloadingNext) {
      console.log('🚀 INFINITE PRACTICE: Preload not started, initiating now...');
      preloadNextBatch();
    }
    
    // Wait for next batch to be available (with timeout)
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 200; // Check every 200ms
    let waitTime = 0;
    
    while ((!nextBatch && !nextBatchRef.current) && waitTime < maxWaitTime) {
      console.log(`⏳ Checking for batch... Wait time: ${waitTime}ms, NextBatch state: ${!!nextBatch}, NextBatch ref: ${!!nextBatchRef.current}`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waitTime += checkInterval;
      
      if (isDisposedRef.current) {
        console.log('🚫 INFINITE PRACTICE: Component disposed while waiting');
        return;
      }
    }
    
    const availableBatch = nextBatch || nextBatchRef.current;
    
    if (availableBatch && availableBatch.length > 0) {
      console.log(`✅ INFINITE PRACTICE: Next batch is ready after ${waitTime}ms wait`);
      console.log(`📋 INFINITE PRACTICE: Batch contains ${availableBatch.length} questions`);
      
      setCurrentBatch(availableBatch);
      setCurrentBatchIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setNextBatch(null);
      nextBatchRef.current = null;
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentQuestionStartTime(Date.now());
      setIsWaitingForBatch(false);
      setIsLoadingNextBatch(false);
      
      console.log(`🎯 INFINITE PRACTICE: Successfully loaded Batch ${currentBatchIndex + 1} with ${availableBatch.length} questions`);
    } else {
      console.error(`❌ INFINITE PRACTICE: Failed to load next batch after ${waitTime}ms`);
      console.log(`🔍 Final state check - NextBatch: ${!!nextBatch}, NextBatchRef: ${!!nextBatchRef.current}, IsPreloading: ${isPreloadingNext}`);
      setIsWaitingForBatch(false);
      setIsLoadingNextBatch(false);
      
      // Try to generate a new batch directly as fallback
      try {
        console.log('🔄 INFINITE PRACTICE: Attempting direct batch generation as fallback...');
        const fallbackBatch = await generateBatch(currentBatchIndex + 1);
        
        if (fallbackBatch && fallbackBatch.length > 0) {
          console.log('✅ INFINITE PRACTICE: Fallback batch generation successful');
          setCurrentBatch(fallbackBatch);
          setCurrentBatchIndex(prev => prev + 1);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setCurrentQuestionStartTime(Date.now());
        } else {
          throw new Error('Fallback batch generation failed');
        }
      } catch (error) {
        console.error('❌ INFINITE PRACTICE: Fallback batch generation failed:', error);
        // As last resort, loop back to first question
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setCurrentQuestionStartTime(Date.now());
      }
    }
  };

  const selectAnswer = useCallback(async (answer) => {
    if (showFeedback || !currentQuestion) return;

    const questionStartTime = currentQuestionStartTime;
    const answerTime = Date.now();
    const timeSpent = Math.round((answerTime - questionStartTime) / 1000);

    const isAnswerCorrect = answer === currentQuestion.correct_answer;

    setSelectedAnswer(answer);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setShowHint(false); // Hide hint when answering
    setTotalQuestions(prev => prev + 1);

    // Auto-scroll to feedback section after a short delay
    setTimeout(() => {
      const feedbackSection = document.getElementById('feedback-section');
      if (feedbackSection) {
        feedbackSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 500);

    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTotalXP(prev => prev + 2);
    }

    // Update performance tracking and history
    const topic = currentQuestion.topic || 'General';
    const difficulty = currentQuestion.difficulty || 'Medium';

    const performanceEntry = {
      questionIndex: totalQuestions,
      topic,
      difficulty,
      isCorrect: isAnswerCorrect,
      timeSpent,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      timestamp: new Date().toISOString(),
      question: currentQuestion.question,
      questionType: currentQuestion.is_adaptive === true ? 'adaptive' : 'standard',
      batchIndex: currentBatchIndex,
    };

    setPerformanceData(prev => [...prev, performanceEntry]);

    const historyEntry = {
      question: currentQuestion.question,
      selected_answer: answer,
      is_correct: isAnswerCorrect,
      correct_answer: currentQuestion.correct_answer,
      xp_earned: isAnswerCorrect ? 2 : 0,
      timestamp: new Date().toISOString(),
      time_spent_on_question: timeSpent,
      topic,
      difficulty,
      is_adaptive: currentQuestion.is_adaptive === true,
      batch_number: currentQuestion.batch_number || currentBatchIndex,
      explanation: currentQuestion.explanation
    };

    setQuestionHistory(prev => [...prev, historyEntry]);

    if (isAnswerCorrect && user) {
      try {
        await updateUserStats({
          xp: (user.xp || 0) + 2,
          coins: (user.coins || 0) + 1,
        });
      } catch (error) {
        console.log('Error updating user stats:', error);
      }
    }
  }, [showFeedback, currentQuestion, currentQuestionStartTime, totalQuestions, currentBatchIndex, user, updateUserStats]);

  const skipQuestion = useCallback(async () => {
    if (showFeedback || !currentQuestion) return;

    const questionStartTime = currentQuestionStartTime;
    const skipTime = Date.now();
    const timeSpent = Math.round((skipTime - questionStartTime) / 1000);

    const topic = currentQuestion.topic || 'General';
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
      questionType: currentQuestion.is_adaptive === true ? 'adaptive' : 'standard',
      batchIndex: currentBatchIndex,
    };

    setPerformanceData(prev => [...prev, performanceEntry]);

    const historyEntry = {
      question: currentQuestion.question,
      selected_answer: null,
      is_correct: false,
      correct_answer: currentQuestion.correct_answer,
      xp_earned: 0,
      timestamp: new Date().toISOString(),
      skipped: true,
      time_spent_on_question: timeSpent,
      topic,
      difficulty,
      is_adaptive: currentQuestion.is_adaptive === true,
      batch_number: currentQuestion.batch_number || currentBatchIndex,
      explanation: currentQuestion.explanation
    };

    setQuestionHistory(prev => [...prev, historyEntry]);
    setTotalQuestions(prev => prev + 1);

    await moveToNextQuestion();
  }, [showFeedback, currentQuestion, currentQuestionStartTime, totalQuestions, currentBatchIndex]);

  const moveToNextQuestion = useCallback(async () => {
    const isLastQuestionInBatch = currentQuestionIndex >= currentBatch.length - 1;
    
    if (isLastQuestionInBatch) {
      console.log('🔄 INFINITE PRACTICE: Reached end of current batch, transitioning to next...');
      await loadNextBatch();
    } else {
      console.log(`➡️ INFINITE PRACTICE: Moving to question ${currentQuestionIndex + 1} in Batch ${currentBatchIndex}`);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowHint(false); // Reset hint state for new question
      setCurrentQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, currentBatch.length, currentBatchIndex, nextBatch]);

  const handleGoBack = useCallback(() => {
    console.log('🔙 INFINITE PRACTICE: User pressed back button');
    cleanup();
    navigate(-1);
  }, [cleanup, navigate]);

  const endPractice = useCallback(() => {
    console.log('🏁 INFINITE PRACTICE: User ended practice session');
    cleanup();
    navigate('/quiz-result', {
      state: {
        mode: 'practice',
        topicName,
        subtopicName,
        totalQuestions,
        correctAnswers,
        totalXP,
        questionHistory,
        performanceData,
        timeSpent: Math.floor((Date.now() - (sessionId ? parseInt(sessionId.split('_')[2]) : Date.now())) / 1000),
        isInfiniteMode: true,
        totalBatches: currentBatchIndex,
        type,
        quizParams
      }
    });
  }, [cleanup, correctAnswers, currentBatchIndex, performanceData, questionHistory, quizParams, sessionId, subtopicName, topicName, totalQuestions, totalXP, type, navigate]);

  const getTextSizeClass = () => {
    switch (accessibilityTextSize) {
      case 'large': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Don't trigger if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      const key = event.key.toLowerCase();
      
      // Answer selection (1-4)
      if (['1', '2', '3', '4'].includes(key) && !showFeedback && currentQuestion?.options) {
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          const optionLetter = String.fromCharCode(65 + optionIndex);
          selectAnswer(optionLetter);
        }
        event.preventDefault();
      }
      
      // Next question (N)
      if (key === 'n' && showFeedback) {
        moveToNextQuestion();
        event.preventDefault();
      }
      
      // Skip question (S)
      if (key === 's' && !showFeedback) {
        skipQuestion();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFeedback, currentQuestion, selectAnswer, moveToNextQuestion, skipQuestion]);

  // Loading screens remain the same but with updated styling
  if (isWaitingForBatch || isLoadingNextBatch || !currentQuestion) {
    return (
      <div 
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2E0059 0%, #4B007D 50%, #F871A0 100%)',
        }}
      >
        {/* Loading content similar to QuizLoadingScreen but adapted for batch transitions */}
        <div className="flex items-center justify-center h-full w-full p-8">
          <div className="text-center max-w-lg">
            <div className="relative w-16 h-16 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {isWaitingForBatch ? 'Preparing Next Batch...' : isLoadingNextBatch ? `Loading Batch ${currentBatchIndex + 1}` : 'Practice Complete'}
            </h1>
            {(isWaitingForBatch || isLoadingNextBatch) && (
              <p className="text-white/80 mb-6">Generating personalized questions based on your performance...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          display: none;
        }
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .progress-ring {
          transform: rotate(-90deg);
        }
        /* Hide scrollbar for main content area */
        .main-content::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        .main-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      
      {/* Full Screen Two-Column Layout */}
      <div className="fixed inset-0 w-screen h-screen flex overflow-hidden">
        {/* Left Panel - Stats & Progress (30-35% width) */}
        <div 
          className="flex-shrink-0 w-80 lg:w-96 h-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(46, 0, 89, 0.95) 0%, rgba(75, 0, 125, 0.9) 50%, rgba(96, 39, 105, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Mobile Stats Toggle */}
          <button
            onClick={() => setIsMobileStatsOpen(!isMobileStatsOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            {isMobileStatsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`h-full flex flex-col p-6 lg:p-8 custom-scrollbar overflow-y-auto ${isMobileStatsOpen ? 'block' : 'hidden lg:flex'}`}>
            {/* Session Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white">∞ Infinite Practice</h1>
                  <p className="text-white/70 text-sm">{topicName}</p>
                </div>
              </div>
              
              {/* Session Progress Bar */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-pink-200 transition-all duration-500 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / currentBatch.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-white/60 text-xs mt-2">
                <span>Question {currentQuestionIndex + 1}/{currentBatch.length}</span>
                <span>Batch {currentBatchIndex}</span>
              </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Total Questions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{totalQuestions}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Questions</div>
                </div>
              </div>

              {/* Correct Answers */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{correctAnswers}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Correct</div>
                </div>
              </div>

              {/* XP Points */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{totalXP}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">XP Points</div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                  </div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Circular Progress Charts */}
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4 text-lg">Performance</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Accuracy Circle */}
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 progress-ring" viewBox="0 0 36 36">
                      <path
                        className="opacity-20"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#accuracy-gradient)"
                        strokeWidth="2"
                        strokeDasharray={`${totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0}, 100`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="text-white/70 text-xs">Accuracy</div>
                </div>

                {/* XP Progress Circle */}
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 progress-ring" viewBox="0 0 36 36">
                      <path
                        className="opacity-20"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#xp-gradient)"
                        strokeWidth="2"
                        strokeDasharray={`${Math.min((totalXP / 100) * 100, 100)}, 100`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{totalXP}</span>
                    </div>
                  </div>
                  <div className="text-white/70 text-xs">XP Earned</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-4">
              <button
                onClick={endPractice}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300"
              >
                End Practice
              </button>
            </div>
          </div>

          {/* SVG Gradients */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="accuracy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right Panel - Question Display (65-70% width) */}
        <div 
          className="flex-1 h-full flex flex-col overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(226, 232, 240, 0.85) 100%)',
          }}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-40 w-40 h-40 bg-gradient-to-br from-blue-200/15 to-purple-200/5 rounded-full blur-3xl"></div>
          </div>

          {/* Mobile Stats Overlay */}
          {isMobileStatsOpen && (
            <div className="lg:hidden absolute inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileStatsOpen(false)} />
          )}

                     {/* Main Question Content */}
           <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10 overflow-y-auto main-content">
             <div className="w-full max-w-4xl py-4 pt-16">
              
              {/* Question Card with Entrance Animation */}
              <div 
                className={`transform transition-all duration-500 ${
                  showContent 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95'
                }`}
              >
                                 {/* Glass Question Card */}
                 <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-6 lg:p-8 mb-6 hover:shadow-3xl transition-all duration-500">
                  
                                     {/* Question Header */}
                   <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Adaptive Badge */}
                      {currentQuestion?.is_adaptive && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-400/30">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700 text-sm font-medium">Adaptive</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Question Progress */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-700 mb-1">
                        {currentQuestionIndex + 1}/{currentBatch.length}
                      </div>
                      <div className="text-gray-500 text-sm">Question</div>
                    </div>
                  </div>

                                     {/* Question Text */}
                   <div 
                     className={`mb-8 transform transition-all duration-300 ${
                       hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                     }`}
                     style={{ transitionDelay: hasEntryAnimationPlayed ? '0ms' : '100ms' }}
                   >
                     <div className="flex items-start justify-between gap-4">
                       <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 leading-relaxed flex-1">
                         {currentQuestion?.question}
                       </h2>
                       
                       {/* Hint Button */}
                       {currentQuestion?.hint && !showFeedback && (
                         <button
                           onClick={() => setShowHint(!showHint)}
                           className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm rounded-xl border border-purple-400/30 text-purple-600 hover:text-purple-700 transition-all duration-300"
                         >
                           <span className="text-lg">💡</span>
                         </button>
                       )}
                     </div>
                     
                     {/* Code Block */}
                     {currentQuestion?.code && (
                       <div className="bg-gray-900/10 backdrop-blur-sm rounded-2xl p-4 mb-4 overflow-x-auto border border-gray-300/30">
                         <pre className="text-green-700 text-sm lg:text-base font-mono">
                           <code>{currentQuestion.code}</code>
                         </pre>
                       </div>
                     )}
                   </div>

                                     {/* Multiple Choice Options */}
                   <div 
                     className={`grid gap-3 lg:gap-4 mb-8 transform transition-all duration-300 ${
                       hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                     }`}
                     style={{ transitionDelay: hasEntryAnimationPlayed ? '0ms' : '200ms' }}
                   >
                     {currentQuestion?.options?.map((option, index) => {
                       const optionLetter = String.fromCharCode(65 + index);
                       const isSelected = selectedAnswer === optionLetter;
                       const isCorrectOption = currentQuestion.correct_answer === optionLetter;
                       
                       let cardClasses = "group relative w-full p-4 lg:p-6 text-left rounded-2xl border-2 transition-all duration-300 transform cursor-pointer ";
                       
                       if (!showFeedback) {
                         cardClasses += isSelected 
                           ? "border-purple-400/60 bg-purple-100/60 shadow-xl scale-105 hover:scale-105" 
                           : "border-gray-200/60 bg-white/40 hover:border-purple-300/60 hover:bg-purple-50/40 hover:scale-102 hover:shadow-xl";
                       } else {
                         if (isCorrectOption) {
                           cardClasses += "border-green-400/60 bg-green-100/60 shadow-xl scale-105";
                         } else if (isSelected && !isCorrectOption) {
                           cardClasses += "border-red-400/60 bg-red-100/60 shadow-xl";
                         } else {
                           cardClasses += "border-gray-200/30 bg-white/20 opacity-60";
                         }
                       }

                       return (
                         <button
                           key={index}
                           onClick={() => !showFeedback && selectAnswer(optionLetter)}
                           disabled={showFeedback}
                           className={cardClasses}
                           style={{ 
                             transitionDelay: hasEntryAnimationPlayed ? '0ms' : `${160 + index * 80}ms`,
                             transformOrigin: 'center',
                             willChange: 'transform, box-shadow'
                           }}
                         >
                           <div className="flex items-center gap-4">
                             {/* Option Badge */}
                             <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                               <span className="text-white font-bold text-base lg:text-lg">{optionLetter}</span>
                             </div>
                             
                             {/* Option Text */}
                             <div className="flex-1">
                               <span className="text-gray-700 font-medium text-base lg:text-lg leading-relaxed block text-left">
                                 {option}
                               </span>
                             </div>
                             
                             {/* Feedback Icons */}
                             {showFeedback && (
                               <div className="flex-shrink-0">
                                 {isCorrectOption && <CheckCircle className="w-6 h-6 text-green-600" />}
                                 {isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-600" />}
                               </div>
                             )}
                           </div>

                           {/* Hover Glow Effect */}
                           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                         </button>
                       );
                     })}
                   </div>

                                     {/* Practice Mode: Instant Feedback */}
                   {showFeedback && (
                     <div 
                       id="feedback-section"
                       className={`mt-16 mb-6 transform transition-all duration-300 ${
                         hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                       }`}
                       style={{ transitionDelay: '300ms' }}
                     >
                       <div className={`p-6 rounded-2xl backdrop-blur-md border ${
                         isCorrect 
                           ? 'bg-green-100/80 border-green-300/60' 
                           : 'bg-red-100/80 border-red-300/60'
                       }`}>
                         <div className="flex items-center gap-3 mb-4">
                           {isCorrect ? (
                             <CheckCircle className="w-6 h-6 text-green-600" />
                           ) : (
                             <XCircle className="w-6 h-6 text-red-600" />
                           )}
                           <span className={`font-bold text-xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                             {isCorrect ? 'Correct!' : 'Incorrect'}
                           </span>
                           {isCorrect && (
                             <div className="flex items-center gap-2 bg-yellow-200/80 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-400/60">
                               <Trophy className="w-4 h-4 text-yellow-600" />
                               <span className="text-yellow-700 text-xs font-medium">+2 XP</span>
                             </div>
                           )}
                         </div>
                         
                         {currentQuestion?.explanation && (
                           <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/60">
                             <p className="text-gray-700 leading-relaxed text-base">{currentQuestion.explanation}</p>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
                     </div>

           {/* Hint Popup Card */}
           {showHint && currentQuestion?.hint && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
               <div className="pointer-events-auto max-w-md w-full bg-gradient-to-br from-purple-500/95 to-pink-500/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-400/30 p-6 transform transition-all duration-300 animate-in slide-in-from-bottom-4">
                 <div className="flex items-start justify-between gap-4 mb-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                       <span className="text-xl">💡</span>
                     </div>
                     <h3 className="text-white font-bold text-lg">Hint</h3>
                   </div>
                   <button
                     onClick={() => setShowHint(false)}
                     className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                   >
                     <X className="w-5 h-5 text-white" />
                   </button>
                 </div>
                 <p className="text-white/90 leading-relaxed text-base mb-4">
                   {currentQuestion.hint}
                 </p>
                 <div className="flex justify-end">
                   <button
                     onClick={() => setShowHint(false)}
                     className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                   >
                     Got it!
                   </button>
                 </div>
               </div>
             </div>
           )}

           {/* Sticky Bottom Action Bar */}
          <div className="flex-shrink-0 bg-white/60 backdrop-blur-xl border-t border-white/40 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Skip Button */}
              <button
                onClick={skipQuestion}
                disabled={showFeedback}
                className="flex items-center gap-3 px-6 py-4 bg-gray-100/60 backdrop-blur-sm text-gray-600 rounded-2xl hover:bg-gray-200/60 hover:text-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300/40 hover:shadow-lg transform hover:scale-105"
              >
                <SkipForward className="w-5 h-5" />
                <span className="font-medium">Skip Question</span>
              </button>

              {/* Center Instructions */}
              {!showFeedback ? (
                <div className="text-gray-600 font-medium text-lg">
                  Select your answer above
                </div>
              ) : (
                <div className="text-gray-500 text-lg">
                  Review the explanation, then continue
                </div>
              )}

              {/* Next/Submit Button */}
              {showFeedback ? (
                <button
                  onClick={moveToNextQuestion}
                  disabled={isLoadingNextBatch}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {isLoadingNextBatch ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <>Next Question</>
                  )}
                </button>
              ) : selectedAnswer ? (
                <button
                  onClick={() => selectAnswer(selectedAnswer)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  disabled
                  className="px-8 py-4 bg-gray-300/60 text-gray-500 rounded-2xl font-bold cursor-not-allowed"
                >
                  Select Answer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Notification */}
      {showAdaptiveNotification && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-xl border border-purple-400/30 animate-bounce">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" />
            <span className="font-medium">Questions adapted to your performance! 🧠</span>
          </div>
        </div>
      )}

      
    </>
  );
};

export default InfinitePracticeMode;