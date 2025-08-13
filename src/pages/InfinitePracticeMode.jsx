import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizService from '../services/QuizService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trophy, Target, Zap, SkipForward, CheckCircle, XCircle, Brain } from 'lucide-react';

const InfinitePracticeMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserStats } = useAuth();
  
  const { questions, topicName, subtopicName, type, quizParams } = location.state || {};

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
  const [topicTimings, setTopicTimings] = useState({});
  const [topicAccuracy, setTopicAccuracy] = useState({});

  // UI states
  const [sessionId, setSessionId] = useState(null);
  const [showAdaptiveNotification, setShowAdaptiveNotification] = useState(false);

  const isDisposedRef = useRef(false);
  const hasInitialized = useRef(false);

  const currentQuestion = currentBatch[currentQuestionIndex] || null;

  useEffect(() => {
    if (!questions || !type || !quizParams) {
      navigate(-1);
      return;
    }

    // Reset disposed flag when component initializes
    isDisposedRef.current = false;
    // Use the initial questions from props instead of generating new ones
    initializeWithProvidedQuestions();
    
    return () => {
      isDisposedRef.current = true;
    };
  }, []);

  const initializeWithProvidedQuestions = () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🚀 INFINITE PRACTICE: Initializing with provided questions');
    console.log('📊 INFINITE PRACTICE: Received questions:', questions?.length || 0);
    
    setSessionId(`infinite_practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Validate and use the provided questions as the first batch
    const validatedQuestions = QuizService.validateQuestions(questions);
    console.log('✅ INFINITE PRACTICE: Validated questions:', validatedQuestions.length);
    
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
    
    const isAdaptive = performanceAnalysis && Object.keys(performanceAnalysis).length > 0;
    if (isAdaptive) {
      console.log('🧠 INFINITE PRACTICE: Using adaptive generation based on performance');
      console.log('📊 INFINITE PRACTICE: Performance data:', performanceAnalysis);
    }

    try {
      console.log('📡 INFINITE PRACTICE: Making API call to generate questions...');
      
      // Use the exact same approach as the initial questions generation
      let questions;
      if (type === 'programming') {
        console.log('🔧 INFINITE PRACTICE: Calling generateProgrammingQuestions...');
        questions = await QuizService.generateProgrammingQuestions({
          mainTopic: quizParams.mainTopic,
          programmingLanguage: quizParams.programmingLanguage,
          subTopic: quizParams.subTopic,
          count: 10,
          setCount: batchNumber,
          mode: 'practice',
          categoryId: quizParams.categoryId,
          subcategory: quizParams.subcategory,
          topic: quizParams.topic,
          performanceData: performanceAnalysis
        });
      } else {
        console.log('🎓 INFINITE PRACTICE: Calling generateAcademicQuestions...');
        questions = await QuizService.generateAcademicQuestions({
          college: quizParams.college,
          department: quizParams.department,
          semester: quizParams.semester,
          subject: quizParams.subject,
          unit: quizParams.unit,
          count: 10,
          setCount: batchNumber,
          mode: 'practice',
          performanceData: performanceAnalysis
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
      console.error(`❌ INFINITE PRACTICE: API call failed for Batch ${batchNumber}:`, error);
      console.error('❌ INFINITE PRACTICE: Error details:', error.message);
      console.error('❌ INFINITE PRACTICE: Full error object:', error);
      throw error;
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
    const shouldPreload = currentQuestionIndex === 2 && currentBatch.length > 0; // Question 3 (0-indexed)
    
    console.log('🔍 INFINITE PRACTICE: Preload check:', {
      currentQuestionIndex: currentQuestionIndex + 1,
      shouldPreload,
      hasNextBatch: !!nextBatch,
      isPreloadingNext,
      currentBatchIndex,
      currentBatchLength: currentBatch.length
    });
    
    if (shouldPreload && !nextBatch && !isPreloadingNext) {
      console.log(`🎯 INFINITE PRACTICE: TRIGGER PRELOAD - User reached Question 3 of Batch ${currentBatchIndex}`);
      console.log(`📡 INFINITE PRACTICE: About to start API call for Batch ${currentBatchIndex + 1}`);
      
      // Ensure component is active for preloading
      if (isDisposedRef.current) {
        console.log('⚠️ INFINITE PRACTICE: Component was marked as disposed, resetting for active use');
        isDisposedRef.current = false;
      }
      
      preloadNextBatch();
    }
  }, [currentQuestionIndex, nextBatch, isPreloadingNext, currentBatch.length, currentBatchIndex]);

  // Check if we need loading screen when reaching question 10
  useEffect(() => {
    const isLastQuestion = currentQuestionIndex >= currentBatch.length - 1;
    const shouldShowWaiting = isLastQuestion && !nextBatch && !isPreloadingNext && !isLoadingNextBatch;
    
    if (shouldShowWaiting) {
      console.log('🚨 INFINITE PRACTICE: Reached end of batch without next batch ready - showing waiting screen');
      setIsWaitingForBatch(true);
      // Force start preloading if not already started
      if (!isPreloadingNext) {
        preloadNextBatch();
      }
    } else {
      setIsWaitingForBatch(false);
    }
  }, [currentQuestionIndex, currentBatch.length, nextBatch, isPreloadingNext, isLoadingNextBatch]);

  const preloadNextBatch = async () => {
    // More detailed logging for debugging
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
      
      if (!isDisposedRef.current && preloadedBatch.length > 0) {
        setNextBatch(preloadedBatch);
        console.log(`✅ INFINITE PRACTICE: SUCCESSFULLY PRELOADED Batch ${nextBatchNumber} with ${preloadedBatch.length} questions`);
        console.log('📋 INFINITE PRACTICE: Sample question from preloaded batch:', preloadedBatch[0]?.question?.substring(0, 50) + '...');
        
        // Clear waiting state if it was active
        setIsWaitingForBatch(false);
      } else {
        console.log('⚠️ INFINITE PRACTICE: Preload completed but no questions received or component disposed');
      }
    } catch (error) {
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

  const selectAnswer = async (answer) => {
    if (showFeedback || !currentQuestion) return;

    const questionStartTime = currentQuestionStartTime;
    const answerTime = Date.now();
    const timeSpent = Math.round((answerTime - questionStartTime) / 1000);

    const isAnswerCorrect = answer === currentQuestion.correct_answer;

    setSelectedAnswer(answer);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setTotalQuestions(prev => prev + 1);

    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTotalXP(prev => prev + 2);
    }

    const topic = extractTopicFromQuestion(currentQuestion);
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

    setTopicAccuracy(prev => ({
      ...prev,
      [topic]: [...(prev[topic] || []), isAnswerCorrect]
    }));

    setTopicTimings(prev => ({
      ...prev,
      [topic]: [...(prev[topic] || []), timeSpent]
    }));

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

    if (isAnswerCorrect) {
      updateUserXP(2);
    }
  };

  const skipQuestion = async () => {
    if (showFeedback || !currentQuestion) return;

    const questionStartTime = currentQuestionStartTime;
    const skipTime = Date.now();
    const timeSpent = Math.round((skipTime - questionStartTime) / 1000);

    const topic = extractTopicFromQuestion(currentQuestion);
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
  };

  const moveToNextQuestion = async () => {
    const isLastQuestionInBatch = currentQuestionIndex >= currentBatch.length - 1;
    
    if (isLastQuestionInBatch) {
      console.log(`🔄 INFINITE PRACTICE: End of Batch ${currentBatchIndex}, attempting to load next batch...`);
      
      // Check if next batch is ready
      if (nextBatch && nextBatch.length > 0) {
        console.log('✅ INFINITE PRACTICE: Next batch ready, loading immediately');
        await loadNextBatch();
      } else {
        console.log('⏳ INFINITE PRACTICE: Next batch not ready, showing loading screen');
        setIsWaitingForBatch(true);
        // Start preloading if not already in progress
        if (!isPreloadingNext) {
          preloadNextBatch();
        }
        // Wait for the batch to be ready
        await waitForNextBatch();
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCurrentQuestionStartTime(Date.now());
      
      console.log(`➡️ INFINITE PRACTICE: Moving to Question ${currentQuestionIndex + 2} in Batch ${currentBatchIndex}`);
    }
  };

  const loadNextBatch = async () => {
    if (isDisposedRef.current) return;

    const nextBatchNumber = currentBatchIndex + 1;
    console.log(`🔄 INFINITE PRACTICE: Loading Batch ${nextBatchNumber}`);
    console.log(`📊 INFINITE PRACTICE: Next batch preloaded: ${!!nextBatch} (${nextBatch?.length || 0} questions)`);

    setIsLoadingNextBatch(true);
    setIsWaitingForBatch(false);

    try {
      let nextBatchQuestions = [];
      let isAdaptiveBatch = false;

      if (nextBatch && nextBatch.length > 0) {
        console.log('✅ INFINITE PRACTICE: Using preloaded batch');
        nextBatchQuestions = nextBatch;
        isAdaptiveBatch = nextBatchQuestions.some(q => q.is_adaptive);
        // Note: nextBatch will be cleared in the state update section
      } else {
        console.log('⚠️ INFINITE PRACTICE: Preload not ready, generating on demand...');
        
        let performanceAnalysis = null;
        if (performanceData.length >= 7) {
          performanceAnalysis = analyzePerformanceForAdaptive();
          isAdaptiveBatch = true;
        }

        console.log(`📡 INFINITE PRACTICE: Emergency API call for Batch ${nextBatchNumber}`);
        const startTime = Date.now();
        nextBatchQuestions = await generateBatch(nextBatchNumber, performanceAnalysis);
        const endTime = Date.now();
        console.log(`🕒 INFINITE PRACTICE: Emergency API call took ${endTime - startTime}ms`);
      }

      if (nextBatchQuestions.length === 0) {
        throw new Error('No valid questions generated for next batch');
      }

      if (!isDisposedRef.current) {
        setCurrentBatch(nextBatchQuestions);
        setCurrentQuestionIndex(0);
        setCurrentBatchIndex(nextBatchNumber);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setCurrentQuestionStartTime(Date.now());
        
        // Clear next batch state since we're now using it
        setNextBatch(null);

        setTimeout(() => {
          if (!isDisposedRef.current) {
            setIsLoadingNextBatch(false);
            
            if (isAdaptiveBatch) {
              setShowAdaptiveNotification(true);
              setTimeout(() => setShowAdaptiveNotification(false), 4000);
            }
          }
        }, 800); // Reduced from 1500ms to 800ms for faster transition

        console.log(`✅ INFINITE PRACTICE: Successfully loaded Batch ${nextBatchNumber} with ${nextBatchQuestions.length} questions`);
        console.log(`📊 INFINITE PRACTICE: Batch index updated from ${currentBatchIndex} to ${nextBatchNumber}`);
      }
    } catch (error) {
      console.error(`❌ INFINITE PRACTICE: Failed to load Batch ${nextBatchNumber}:`, error);
      if (!isDisposedRef.current) {
        setIsLoadingNextBatch(false);
        setIsWaitingForBatch(false);
        // Show error and allow retry
        console.log('🔄 INFINITE PRACTICE: Will retry in 3 seconds...');
        setTimeout(() => {
          if (!isDisposedRef.current) {
            preloadNextBatch();
          }
        }, 3000);
      }
    }
  };

  const waitForNextBatch = async () => {
    console.log('⏳ INFINITE PRACTICE: Waiting for next batch to be ready...');
    
    return new Promise((resolve) => {
      const checkBatch = () => {
        if (nextBatch && nextBatch.length > 0) {
          console.log('✅ INFINITE PRACTICE: Next batch now ready!');
          setIsWaitingForBatch(false);
          loadNextBatch().then(resolve);
        } else if (isDisposedRef.current) {
          resolve();
        } else {
          // Check again in 500ms
          setTimeout(checkBatch, 500);
        }
      };
      
      checkBatch();
    });
  };

  const retryBatchLoad = async () => {
    console.log('🔄 INFINITE PRACTICE: Manual retry triggered by user...');
    
    // Reset all states
    setNextBatch(null);
    setIsWaitingForBatch(true);
    setIsPreloadingNext(false);
    setIsLoadingNextBatch(false);
    
    // Ensure component is not marked as disposed
    isDisposedRef.current = false;
    
    // Force clear any existing requests
    QuizService.clearAllRequests();
    
    try {
      await preloadNextBatch();
    } catch (error) {
      console.error('❌ INFINITE PRACTICE: Manual retry failed:', error);
      // Keep waiting state so user can try again
    }
  };

  const extractTopicFromQuestion = (question) => {
    const questionText = question.question || '';
    const topic = question.topic || question.subject || '';
    
    if (topic) return topic;

    const topicKeywords = ['variables', 'functions', 'loops', 'arrays', 'objects', 'classes', 'strings', 'methods'];
    const foundTopic = topicKeywords.find(keyword => 
      questionText.toLowerCase().includes(keyword)
    );
    
    return foundTopic || 'General Programming';
  };

  const updateUserXP = async (xpGained) => {
    try {
      if (user) {
        await updateUserStats({
          xp: (user.xp || 0) + xpGained,
          coins: (user.coins || 0) + Math.floor(xpGained / 2),
        });
      }
    } catch (error) {
      console.log('Error updating user XP:', error);
    }
  };

  const endPractice = () => {
    console.log(`🏁 INFINITE PRACTICE: Ending practice session after ${totalQuestions} questions across ${currentBatchIndex} batches`);
    
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
  };

  // Loading screen when waiting for next batch at question 10
  if (isWaitingForBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-spin opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-white/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-yellow-400/30 animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            ⏳ Parsing Next Batch
          </h2>
          
          <p className="text-white/80 text-base mb-4">
            You've reached question 10! The next batch of questions is being generated and parsed...
          </p>
          
          <div className="w-full bg-white/20 rounded-full h-3 mb-6">
            <div className="h-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>

          {totalQuestions > 0 && (
            <div className="text-white/70 text-sm mb-4">
              Completed {totalQuestions} questions • {Math.round((correctAnswers / totalQuestions) * 100)}% accuracy
            </div>
          )}
          
          <button
            onClick={retryBatchLoad}
            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg"
          >
            Retry if Stuck
          </button>
        </div>
      </div>
    );
  }

  // Loading screen for batch transitions
  if (isLoadingNextBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-white/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-purple-400/30 animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Preparing Batch {currentBatchIndex + 1}
          </h2>
          
          <p className="text-white/80 text-base mb-4">
            Generating 10 new questions based on your performance...
          </p>
          
          <div className="w-full bg-white/20 rounded-full h-3 mb-6">
            <div className="h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>

          {totalQuestions > 0 && (
            <div className="text-white/70 text-sm mb-4">
              You've completed {totalQuestions} questions so far • {Math.round((correctAnswers / totalQuestions) * 100)}% accuracy
            </div>
          )}
          
          <button
            onClick={retryBatchLoad}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            Retry if Stuck
          </button>
        </div>
      </div>
    );
  }

  // No question available
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-4">Practice Session Complete!</h2>
          <p className="text-white/70 mb-6">Great job on your infinite practice session!</p>
          <button
            onClick={endPractice}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {showAdaptiveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Questions adapted to your performance! 🧠</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">∞ Infinite Practice</h1>
            <p className="text-white/70 text-sm">{topicName} • {subtopicName}</p>
          </div>

          <button
            onClick={endPractice}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            End Practice
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalQuestions}</div>
            <div className="text-white/70 text-sm">Questions</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{correctAnswers}</div>
            <div className="text-white/70 text-sm">Correct</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalXP}</div>
            <div className="text-white/70 text-sm">XP Earned</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
            </div>
            <div className="text-white/70 text-sm">Accuracy</div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm">
                Batch {currentBatchIndex} • Question {currentQuestionIndex + 1}/{currentBatch.length}
              </span>
              {isPreloadingNext && (
                <span className="text-purple-300 text-xs animate-pulse">• Preparing next batch...</span>
              )}
            </div>
            
            {currentQuestion?.is_adaptive && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full animate-pulse">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">Adaptive</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.code && (
              <div className="bg-gray-900/50 rounded-lg p-4 mb-4 overflow-x-auto border border-white/10">
                <pre className="text-green-400 text-sm">
                  <code>{currentQuestion.code}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="grid gap-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === optionLetter;
              const isCorrectOption = currentQuestion.correct_answer === optionLetter;
              
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";
              
              if (!showFeedback) {
                buttonClass += isSelected 
                  ? "border-purple-400 bg-purple-500/20 text-white shadow-lg transform scale-[1.02]" 
                  : "border-white/20 bg-white/5 text-white hover:border-purple-300 hover:bg-purple-500/10 hover:transform hover:scale-[1.01]";
              } else {
                if (isCorrectOption) {
                  buttonClass += "border-green-400 bg-green-500/20 text-green-100 shadow-lg";
                } else if (isSelected && !isCorrectOption) {
                  buttonClass += "border-red-400 bg-red-500/20 text-red-100 shadow-lg";
                } else {
                  buttonClass += "border-white/20 bg-white/5 text-white/50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && selectAnswer(optionLetter)}
                  disabled={showFeedback}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        {optionLetter}
                      </span>
                      <span className="flex-grow">{option}</span>
                    </div>
                    {showFeedback && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {showFeedback && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                </button>
                );
              })}
            </div>
  
            {showFeedback && (
              <div className="mb-6">
                <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                    <span className={`font-semibold ${isCorrect ? 'text-green-100' : 'text-red-100'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                    {isCorrect && <span className="text-yellow-300 text-sm font-medium">+2 XP</span>}
                  </div>
                  {currentQuestion.explanation && (
                    <p className="text-white/90 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                  )}
                </div>
              </div>
            )}
  
            <div className="flex items-center justify-between">
              <button
                onClick={skipQuestion}
                disabled={showFeedback}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
  
              {!showFeedback && (
                <div className="text-white/70 text-sm">
                  Select your answer above
                </div>
              )}
  
              {showFeedback && (
                <button
                  onClick={moveToNextQuestion}
                  disabled={isLoadingNextBatch}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingNextBatch ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Next Question'
                  )}
                </button>
              )}
            </div>
  
            {currentQuestion?.hint && !showFeedback && (
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">💡</span>
                  </div>
                  <div>
                    <span className="text-blue-100 text-sm font-medium">Hint: </span>
                    <span className="text-blue-100 text-sm">{currentQuestion.hint}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
  
          {isPreloadingNext && (
            <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white/70 text-sm">Preparing Batch {currentBatchIndex + 1} in background...</span>
              </div>
            </div>
          )}
  
          {performanceData.length >= 5 && (
            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Performance Insights</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {performanceData.length > 0 ? Math.round((performanceData.filter(p => p.isCorrect).length / performanceData.length) * 100) : 0}%
                  </div>
                  <div className="text-white/70 text-sm">Recent Accuracy</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {performanceData.length > 0 ? Math.round(performanceData.slice(-10).reduce((acc, p) => acc + p.timeSpent, 0) / Math.min(performanceData.length, 10)) : 0}s
                  </div>
                  <div className="text-white/70 text-sm">Avg Time (Last 10)</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white mb-1">
                    {Object.keys(topicAccuracy).length}
                  </div>
                  <div className="text-white/70 text-sm">Topics Covered</div>
                </div>
              </div>
  
              {Object.keys(topicAccuracy).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-3">Topic Performance</h4>
                  <div className="grid gap-2">
                    {Object.entries(topicAccuracy).slice(0, 3).map(([topic, accuracyList]) => {
                      const accuracy = Math.round((accuracyList.filter(Boolean).length / accuracyList.length) * 100);
                      const averageTime = topicTimings[topic] ? Math.round(topicTimings[topic].reduce((a, b) => a + b, 0) / topicTimings[topic].length) : 0;
                      
                      return (
                        <div key={topic} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <div className="text-white font-medium text-sm">{topic}</div>
                            <div className="text-white/60 text-xs">{accuracyList.length} questions • {averageTime}s avg</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {accuracy}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
  
              {performanceData.length >= 7 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-100 text-sm font-medium">
                      Adaptive mode active - Questions are now personalized to your performance! 
                    </span>
                  </div>
                </div>
              )}
  
              {performanceData.length < 7 && (
                <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-100 text-sm font-medium">
                      Answer {7 - performanceData.length} more questions to unlock adaptive mode!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
  
          <div className="mt-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-4 border border-indigo-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">∞</span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Infinite Practice Mode</div>
                  <div className="text-white/70 text-xs">Questions generate endlessly • Adaptive difficulty • Performance tracking</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{currentBatchIndex}</div>
                <div className="text-white/70 text-xs">Batches</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default InfinitePracticeMode;