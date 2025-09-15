import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Clock, 
  RotateCcw, 
  Home, 
  CheckCircle, 
  XCircle, 
  Star,
  TrendingUp,
  Award,
  ArrowLeft,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  ChevronRight,
  Zap,
  Activity,
  Calendar,
  Flame,
  Menu,
  X
} from 'lucide-react';

const QuizResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const confettiRef = useRef(null);
  
  const {
    mode,
    topicName,
    subtopicName,
    totalQuestions,
    correctAnswers,
    totalXP,
    questionHistory = [],
    type,
    quizParams,
    timeSpent,
    isInfiniteMode,
    performanceData = [],
    totalBatches = 1
  } = location.state || {};

  // Animation states
  const [hasEntryAnimationPlayed, setHasEntryAnimationPlayed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedStats, setAnimatedStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    timeSpent: 0,
    score: 0
  });

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2E0059] via-[#4B007D] to-[#F871A0] p-8 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <p className="text-white text-lg mb-4">No results data available</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const score = mode === 'test' ? Math.round((percentage * totalQuestions) / 10) : null;
  const isPassed = percentage >= 60;
  
  // Entry animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setShowConfetti(true);
      setTimeout(() => setHasEntryAnimationPlayed(true), 500);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Animate stats count-up
  useEffect(() => {
    if (!showContent) return;

    const duration = 1000; // 1 second
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    const timer = setTimeout(() => {
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setAnimatedStats({
          totalQuestions: Math.round(totalQuestions * easeOutQuart),
          correctAnswers: Math.round(correctAnswers * easeOutQuart),
          accuracy: Math.round(percentage * easeOutQuart),
          timeSpent: Math.round((timeSpent || 0) * easeOutQuart),
          score: score ? Math.round(score * easeOutQuart) : 0
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedStats({
            totalQuestions,
            correctAnswers,
            accuracy: percentage,
            timeSpent: timeSpent || 0,
            score: score || 0
          });
        }
      }, stepDuration);
    }, 300);

    return () => clearTimeout(timer);
  }, [showContent, totalQuestions, correctAnswers, percentage, timeSpent, score]);

  // Remove confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding Performance!", emoji: "🎉", color: "text-green-400" };
    if (percentage >= 80) return { message: "Excellent Work!", emoji: "👏", color: "text-green-400" };
    if (percentage >= 70) return { message: "Great Job!", emoji: "👍", color: "text-blue-400" };
    if (percentage >= 60) return { message: "Good Effort!", emoji: "💪", color: "text-yellow-400" };
    return { message: "Keep Practicing!", emoji: "📚", color: "text-orange-400" };
  };

  const performance = getPerformanceMessage();

  const handlePracticeAgain = () => {
    navigate('/quiz-loading', {
      state: {
        mode: isInfiniteMode ? 'practice' : mode,
        type,
        quizParams,
        topicName,
        subtopicName
      }
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryWrongOnly = () => {
    // Filter incorrect questions for retry
    const incorrectQuestions = questionHistory.filter(q => !q.is_correct && !q.skipped);
    if (incorrectQuestions.length > 0) {
      navigate('/quiz-loading', {
        state: {
          mode: 'practice',
          type,
          quizParams: { ...quizParams, retryMode: true },
          topicName,
          subtopicName,
          focusQuestions: incorrectQuestions
        }
      });
    }
  };

  const processQuestionHistory = () => {
    if (!questionHistory || !Array.isArray(questionHistory)) {
      return [];
    }

    return questionHistory.slice(0, 20).map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return {
          question: typeof item.question === 'string' ? item.question : 'Question not available',
          selected: item.selected_answer || 'Not answered',
          correct: item.correct_answer || 'N/A',
          isCorrect: Boolean(item.is_correct),
          explanation: item.explanation || 'No explanation available',
          skipped: Boolean(item.skipped),
          topic: item.topic || 'General'
        };
      }
      
      return {
        question: `Question ${index + 1}`,
        selected: 'Not answered',
        correct: 'N/A',
        isCorrect: false,
        explanation: 'No explanation available',
        skipped: false,
        topic: 'General'
      };
    });
  };

  const processedQuestions = processQuestionHistory();
  const incorrectCount = processedQuestions.filter(q => !q.isCorrect && !q.skipped).length;
  const skippedCount = processedQuestions.filter(q => q.skipped).length;

  // Filter questions based on selected filter and search query
  const filteredQuestions = processedQuestions.filter(question => {
    // Filter by status
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'Correct':
        matchesFilter = question.isCorrect;
        break;
      case 'Incorrect':
        matchesFilter = !question.isCorrect && !question.skipped;
        break;
      case 'Skipped':
        matchesFilter = question.skipped;
        break;
      case 'All':
      default:
        matchesFilter = true;
        break;
    }

    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.correct && question.correct.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (question.selected && question.selected.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Generate improvement tips based on performance
  const getImprovementTips = () => {
    const tips = [];
    const accuracyScore = percentage;
    
    if (accuracyScore < 70) {
      tips.push("Review fundamental concepts before attempting more questions");
      tips.push("Take your time to read each question carefully");
    }
    
    if (incorrectCount > correctAnswers * 0.3) {
      tips.push("Focus on understanding why answers are correct, not just memorizing");
    }
    
    if (skippedCount > 2) {
      tips.push("Practice similar questions to build confidence before skipping");
    }
    
    if (isInfiniteMode && totalBatches < 3) {
      tips.push("Try longer practice sessions to improve consistency");
    }
    
    tips.push("Use the explanations to learn from incorrect answers");
    
    return tips.slice(0, 4);
  };

  const improvementTips = getImprovementTips();

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, rgba(248, 113, 160, 0.6), rgba(75, 0, 125, 0.6));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, rgba(248, 113, 160, 0.8), rgba(75, 0, 125, 0.8));
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(248, 113, 160, 0.6) rgba(255, 255, 255, 0.1);
        }
        .progress-ring {
          transform: rotate(-90deg);
        }
        .main-content::-webkit-scrollbar {
          width: 6px;
        }
        .main-content {
          scrollbar-width: thin;
          scrollbar-color: rgba(248, 113, 160, 0.3) rgba(255, 255, 255, 0.1);
        }
        .question-card {
          transition: all 300ms ease;
          transform-origin: center;
          will-change: transform, box-shadow;
        }
        .question-card:hover {
          transform: scale(1.02) translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        details > summary {
          list-style: none;
        }
        details > summary::-webkit-details-marker {
          display: none;
        }
        details[open] > summary .chevron {
          transform: rotate(90deg);
        }
      `}</style>
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1000}ms`,
                  animationDuration: '1500ms'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#F871A0', '#FAD4E6', '#FFFFFF', '#4B007D'][Math.floor(Math.random() * 4)]
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Layout with Animated Background */}
      <div 
        className="fixed inset-0 w-screen h-screen overflow-auto"
        style={{
          background: 'linear-gradient(135deg, #2E0059 0%, #4B007D 50%, #F871A0 100%)',
        }}
      >
        {/* Animated Background Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute animate-pulse opacity-30"
            style={{
              top: '10%',
              right: '15%',
              width: '30rem',
              height: '30rem',
              background: 'radial-gradient(circle, rgba(248, 113, 160, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              animationDuration: '4s'
            }}
          />
          <div 
            className="absolute animate-pulse opacity-20"
            style={{
              bottom: '20%',
              left: '10%',
              width: '25rem',
              height: '25rem',
              background: 'radial-gradient(circle, rgba(126, 58, 242, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              animationDelay: '2s',
              animationDuration: '6s'
            }}
          />
        </div>

        {/* Hero Banner Section */}
        <div className="relative z-10 pt-8 pb-6 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Trophy Icon with Animation */}
            <div 
              className={`w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 transition-all duration-1000 ${
                hasEntryAnimationPlayed ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-12 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Trophy className="text-white w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 
              className={`text-4xl lg:text-6xl font-black text-white mb-4 transition-all duration-700 delay-200 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {isInfiniteMode 
                ? 'Practice Complete!' 
                : mode === 'practice' 
                  ? 'Practice Complete!' 
                  : 'Test Complete!'
              }
            </h1>

            {/* Summary Sentence */}
            <p 
              className={`text-xl lg:text-2xl text-white/90 mb-8 transition-all duration-700 delay-400 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              You completed <strong>{totalQuestions} questions</strong> {timeSpent && formatTime(timeSpent) !== 'N/A' ? `in ${formatTime(timeSpent)}` : ''}. Let's see how you did!
            </p>

            {/* Central Radial Accuracy Chart */}
            <div 
              className={`relative w-48 h-48 lg:w-56 lg:h-56 mx-auto mb-8 transition-all duration-1000 delay-600 ${
                hasEntryAnimationPlayed ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}
            >
              <div className="relative w-full h-full">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-white/5 animate-pulse"></div>
                
                {/* Main Chart */}
                <svg className="w-full h-full progress-ring" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="opacity-20"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  {/* Progress Circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#hero-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${animatedStats.accuracy}, 100`}
                    className="transition-all duration-2000 ease-out"
                  />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl lg:text-6xl font-black text-white mb-2 transition-all duration-1000 delay-800 ${
                    percentage >= 80 ? 'text-green-300' : 
                    percentage >= 60 ? 'text-yellow-300' : 'text-red-300'
                  }`}>
                    {animatedStats.accuracy}%
                  </div>
                  <div className="text-white/80 text-lg font-medium">Accuracy</div>
                  <div className="text-white/60 text-sm mt-1">{performance.message}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Body: Split Panels */}
        <div className="relative z-10 flex flex-col lg:flex-row min-h-0 flex-1 gap-6 px-4 lg:px-8 pb-8">
          {/* Left Panel - Performance Overview */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <h2 className={`text-2xl lg:text-3xl font-bold text-white mb-6 transition-all duration-500 delay-1000 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                📊 Performance Overview
              </h2>
              {/* Large Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Correct Answers */}
                <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`} style={{ transitionDelay: '1100ms' }}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white mb-2">{animatedStats.correctAnswers}</div>
                    <div className="text-green-300 font-bold text-lg mb-1">✅ Correct</div>
                    <div className="text-white/60 text-sm">Well done!</div>
                  </div>
                </div>

                {/* Incorrect Answers */}
                <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`} style={{ transitionDelay: '1200ms' }}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white mb-2">{incorrectCount}</div>
                    <div className="text-red-300 font-bold text-lg mb-1">❌ Incorrect</div>
                    <div className="text-white/60 text-sm">Room to improve</div>
                  </div>
                </div>

                {/* Skipped Questions */}
                <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`} style={{ transitionDelay: '1300ms' }}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white mb-2">{skippedCount}</div>
                    <div className="text-gray-300 font-bold text-lg mb-1">➖ Skipped</div>
                    <div className="text-white/60 text-sm">Missed chances</div>
                  </div>
                </div>

                {/* Time Taken */}
                <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300 group ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`} style={{ transitionDelay: '1400ms' }}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-black text-white mb-2">{formatTime(animatedStats.timeSpent)}</div>
                    <div className="text-purple-300 font-bold text-lg mb-1">⏱ Time Taken</div>
                    <div className="text-white/60 text-sm">Duration</div>
                  </div>
                </div>
              </div>

              {/* Performance Breakdown Linear Progress */}
              <div className={`mb-6 transition-all duration-500 delay-1500 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}>
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Breakdown
                  </h4>
                  <div className="relative h-6 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-2000 delay-1600"
                      style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                    />
                    {incorrectCount > 0 && (
                      <div 
                        className="absolute top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-2000 delay-1600"
                        style={{ 
                          left: `${(correctAnswers / totalQuestions) * 100}%`,
                          width: `${(incorrectCount / totalQuestions) * 100}%` 
                        }}
                      />
                    )}
                    {skippedCount > 0 && (
                      <div 
                        className="absolute top-0 h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-2000 delay-1600"
                        style={{ 
                          left: `${((correctAnswers + incorrectCount) / totalQuestions) * 100}%`,
                          width: `${(skippedCount / totalQuestions) * 100}%` 
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-white/70 mt-3">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      {correctAnswers} Correct
                    </span>
                    {incorrectCount > 0 && (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        {incorrectCount} Wrong
                      </span>
                    )}
                    {skippedCount > 0 && (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        {skippedCount} Skipped
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Streak Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`bg-gradient-to-br from-orange-400/20 to-red-500/20 backdrop-blur-lg rounded-3xl p-6 border border-orange-300/30 transition-all duration-300 hover:scale-105 ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`} style={{ transitionDelay: '1600ms' }}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-black text-white mb-1">{correctAnswers > 0 ? Math.max(correctAnswers, 1) : 0}</div>
                    <div className="text-orange-300 font-bold">Best Streak</div>
                  </div>
                </div>

                <div className={`bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-lg rounded-3xl p-6 border border-yellow-300/30 transition-all duration-300 hover:scale-105 ${
                  hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`} style={{ transitionDelay: '1700ms' }}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-black text-white mb-1">{totalXP || animatedStats.score}</div>
                    <div className="text-yellow-300 font-bold">{mode === 'test' ? 'Score' : 'XP Earned'}</div>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div className={`mt-auto space-y-4 transition-all duration-500 delay-1800 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}>
                <button
                  onClick={handlePracticeAgain}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-3xl text-white font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 group"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Practice Again
                </button>

                <button 
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-3xl text-white font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 group"
                >
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Share Results
                </button>

                <button 
                  onClick={handleGoHome}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-3xl text-white font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 group"
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Home
                </button>

                {mode === 'practice' && incorrectCount > 0 && (
                  <button
                    onClick={handleRetryWrongOnly}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry Wrong Only
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Question Review */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8 flex-1 overflow-hidden flex flex-col">
              {/* Header with Filters */}
              <div className={`mb-6 transition-all duration-500 delay-2000 ${
                hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    📝 Question Review
                  </h2>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {['All', 'Correct', 'Incorrect'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium transition-all duration-300 border whitespace-nowrap ${
                        selectedFilter === filter
                          ? 'bg-purple-500/30 text-white border-purple-400/50'
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search questions by keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-300"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Scrollable Questions Box */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 150px)', minHeight: '880px', maxHeight: '1080px' }}>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-2">
                {filteredQuestions.map((item, index) => (
                  <div
                    key={index}
                    className={`bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-6 hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group ${
                      hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${2200 + index * 150}ms` }}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                          item.isCorrect 
                            ? 'bg-gradient-to-br from-green-500 to-green-600' 
                            : item.skipped
                              ? 'bg-gradient-to-br from-gray-500 to-gray-600'
                              : 'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                          {item.isCorrect ? (
                            <CheckCircle className="text-white w-5 h-5" />
                          ) : item.skipped ? (
                            <span className="text-white text-xs font-bold">?</span>
                          ) : (
                            <XCircle className="text-white w-5 h-5" />
                          )}
                        </div>
                        
                        <div>
                          <div className="text-lg font-black text-white mb-1">
                            Question {index + 1}
                          </div>
                          <div className={`text-sm font-medium ${
                            item.isCorrect ? 'text-green-300' : item.skipped ? 'text-gray-300' : 'text-red-300'
                          }`}>
                            {item.isCorrect ? '✅ Correct' : item.skipped ? '➖ Skipped' : '❌ Incorrect'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Topic Badge */}
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-400/30">
                        <span className="text-purple-200 text-xs font-medium">{item.topic}</span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
                      {item.question}
                    </h3>

                    {/* Answer Options */}
                    <div className="space-y-3 mb-4">
                        {[item.selected, item.correct].filter(Boolean).filter((value, index, self) => self.indexOf(value) === index).map((option, optionIndex) => {
                          const isUserSelected = option === item.selected;
                          const isCorrectAnswer = option === item.correct;
                          const optionLetter = String.fromCharCode(65 + optionIndex);
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                                isCorrectAnswer
                                  ? 'border-green-400/60 bg-green-500/20'
                                  : isUserSelected && !isCorrectAnswer
                                    ? 'border-red-400/60 bg-red-500/20'
                                    : 'border-white/20 bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                  isCorrectAnswer
                                    ? 'bg-green-500 text-white'
                                    : isUserSelected && !isCorrectAnswer
                                      ? 'bg-red-500 text-white'
                                      : 'bg-purple-500 text-white'
                                }`}>
                                  {optionLetter}
                                </div>
                                <span className="text-white font-medium flex-1">{option}</span>
                                <div className="flex items-center gap-2">
                                    {isUserSelected && (
                                      <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full">
                                        Your answer
                                      </span>
                                    )}
                                    {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-400" />}
                                    {isUserSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-400" />}
                                  </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>


                    {/* Explanation */}
                    {item.explanation && item.explanation !== 'No explanation available' && (
                      <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-4 border border-yellow-300/30 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                          <span className="font-bold text-yellow-300">Explanation</span>
                        </div>
                        <p className="text-white/90 leading-relaxed">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Improvement Tips */}
                {percentage < 85 && improvementTips.length > 0 && (
                  <div className={`bg-yellow-400/10 backdrop-blur-xl rounded-3xl border border-yellow-300/30 p-6 transition-all duration-500 ${
                    hasEntryAnimationPlayed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`} style={{ transitionDelay: `${2200 + filteredQuestions.length * 150}ms` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-yellow-300">💡 Tips to Improve</h3>
                    </div>
                    <ul className="text-yellow-200 space-y-2">
                      {improvementTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-yellow-400 mt-1 text-lg">•</span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Gradients */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
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
    </>
  );
};

export default QuizResultScreen;