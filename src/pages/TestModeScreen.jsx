import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Flag, 
  AlertCircle, 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle,
  Menu,
  X,
  BookOpen,
  Users,
  BarChart3,
  Activity
} from 'lucide-react';

const TestModeScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, topicName, subtopicName, type, quizParams } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime] = useState(Date.now());
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hasEntryAnimationPlayed, setHasEntryAnimationPlayed] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate(-1);
    }
  }, [questions, navigate]);

  // Entry animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setTimeout(() => setHasEntryAnimationPlayed(true), 500);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No questions available</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitTest = () => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    let correctAnswers = 0;
    const questionHistory = questions.map((question, index) => {
      const selected = selectedAnswers[index] || '';
      const isCorrect = selected === question.correct_answer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        selected,
        correct: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        hint: question.hint
      };
    });

    navigate('/quiz-result', {
      state: {
        mode: 'test',
        topicName,
        subtopicName,
        totalQuestions: questions.length,
        correctAnswers,
        totalXP: correctAnswers * 10,
        questionHistory,
        type,
        quizParams,
        timeSpent
      }
    });
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isTimeRunningOut = timeLeft <= 300; // 5 minutes

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
                  onClick={() => setShowSubmitModal(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-white">🎯 Test Mode</h1>
                  <p className="text-white/70 text-sm">{topicName}</p>
                </div>
              </div>
              
              {/* Timer and Progress */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-white" />
                    <span className="text-white/70 text-sm">Time Remaining</span>
                  </div>
                  <div className={`text-xl font-mono font-bold ${isTimeRunningOut ? 'text-red-300' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                {isTimeRunningOut && (
                  <div className="text-red-300 text-xs animate-pulse">⚠️ Less than 5 minutes left!</div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-pink-200 transition-all duration-500 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-white/60 text-xs mt-2">
                <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                <span>Answered: {getAnsweredCount()}</span>
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
                  <div className="text-2xl font-black text-white mb-1">{questions.length}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Questions</div>
                </div>
              </div>

              {/* Answered Count */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{getAnsweredCount()}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Answered</div>
                </div>
              </div>

              {/* Completion Percentage */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    {questions.length > 0 ? Math.round((getAnsweredCount() / questions.length) * 100) : 0}%
                  </div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Complete</div>
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{questions.length - getAnsweredCount()}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wider">Remaining</div>
                </div>
              </div>
            </div>

            {/* Question Navigation Grid */}
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4 text-lg">Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                      selectedAnswers[index]
                        ? 'bg-green-500/80 border-green-400 text-white shadow-lg'
                        : index === currentQuestionIndex
                        ? 'bg-white/20 border-white text-white shadow-lg scale-110'
                        : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20 hover:border-white/50 hover:scale-105'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Instructions */}
            <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-white/80 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-white font-medium mb-2">Test Instructions:</p>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• Navigate freely between questions</li>
                    <li>• No feedback until submission</li>
                    <li>• Submit before time expires</li>
                    <li>• Review all answers before submitting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-auto space-y-4">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-500 hover:to-green-600 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Flag className="w-5 h-5" />
                Submit Test
              </button>
            </div>
          </div>
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
                      {/* Test Mode Badge */}
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 text-sm font-medium">Test Mode</span>
                      </div>
                    </div>
                    
                    {/* Question Progress */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-700 mb-1">
                        {currentQuestionIndex + 1}/{questions.length}
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
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                      {currentQuestion?.question}
                    </h2>
                    
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
                      const isSelected = selectedAnswers[currentQuestionIndex] === option;
                      
                      let cardClasses = "group relative w-full p-4 lg:p-6 text-left rounded-2xl border-2 transition-all duration-300 transform cursor-pointer ";
                      
                      cardClasses += isSelected 
                        ? "border-purple-400/60 bg-purple-100/60 shadow-xl scale-105 hover:scale-105" 
                        : "border-gray-200/60 bg-white/40 hover:border-purple-300/60 hover:bg-purple-50/40 hover:scale-102 hover:shadow-xl";

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
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
                            
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-purple-600" />
                              </div>
                            )}
                          </div>

                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Navigation Bar */}
          <div className="flex-shrink-0 bg-white/60 backdrop-blur-xl border-t border-white/40 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-3 px-6 py-4 bg-gray-100/60 backdrop-blur-sm text-gray-600 rounded-2xl hover:bg-gray-200/60 hover:text-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300/40 hover:shadow-lg transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </button>

              {/* Center Status */}
              <div className="text-center">
                <div className="text-gray-600 font-medium text-lg mb-1">
                  {selectedAnswers[currentQuestionIndex] ? '✓ Answered' : 'Select your answer'}
                </div>
                <div className="text-gray-500 text-sm">
                  Navigate freely between questions
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="font-medium">Next</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/40">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Flag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Test?</h3>
              <p className="text-gray-600">
                You have answered <strong>{getAnsweredCount()}</strong> out of <strong>{questions.length}</strong> questions.
              </p>
              {getAnsweredCount() < questions.length && (
                <p className="text-amber-600 text-sm mt-2 font-medium">
                  ⚠️ {questions.length - getAnsweredCount()} questions remain unanswered
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300 border border-gray-300"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestModeScreen;