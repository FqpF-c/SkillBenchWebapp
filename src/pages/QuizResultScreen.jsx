import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Target, Clock, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';

const QuizResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
    isInfiniteMode
  } = location.state || {};

  if (!location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No results data available</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 60;
  
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding! 🎉", color: "text-green-600" };
    if (percentage >= 80) return { message: "Excellent work! 👏", color: "text-green-600" };
    if (percentage >= 70) return { message: "Great job! 👍", color: "text-blue-600" };
    if (percentage >= 60) return { message: "Good effort! 💪", color: "text-yellow-600" };
    return { message: "Keep practicing! 📚", color: "text-red-600" };
  };

  const performance = getPerformanceMessage();

  const handleRetry = () => {
    if (isInfiniteMode) {
      navigate('/quiz-loading', {
        state: {
          mode: 'practice',
          type,
          quizParams,
          topicName,
          subtopicName
        }
      });
    } else {
      navigate('/quiz-loading', {
        state: {
          mode,
          type,
          quizParams,
          topicName,
          subtopicName
        }
      });
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const processQuestionHistory = () => {
    if (!questionHistory || !Array.isArray(questionHistory)) {
      return [];
    }

    return questionHistory.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return {
          question: typeof item.question === 'string' ? item.question : 'Question not available',
          selected: item.selected_answer || 'Not answered',
          correct: item.correct_answer || 'N/A',
          isCorrect: Boolean(item.is_correct),
          explanation: item.explanation || 'No explanation available',
          skipped: Boolean(item.skipped)
        };
      }
      
      return {
        question: `Question ${index + 1}`,
        selected: 'Not answered',
        correct: 'N/A',
        isCorrect: false,
        explanation: 'No explanation available',
        skipped: false
      };
    });
  };

  const processedQuestions = processQuestionHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className={`${isPassed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-600 to-red-600'} text-white p-8`}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isInfiniteMode ? 'Infinite Practice Complete!' : mode === 'practice' ? 'Practice Complete!' : 'Test Complete!'}
          </h1>
          <p className={`text-xl ${performance.color.replace('text-', 'text-white/')}90`}>
            {performance.message}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{topicName}</h2>
            <p className="text-gray-600">{subtopicName}</p>
            {isInfiniteMode && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Infinite Mode
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800">{totalQuestions}</div>
              <div className="text-gray-600 text-sm">Total Questions</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800">{correctAnswers}</div>
              <div className="text-gray-600 text-sm">Correct Answers</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                {percentage}%
              </div>
              <div className="text-gray-600 text-sm">Accuracy</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800">{formatTime(timeSpent)}</div>
              <div className="text-gray-600 text-sm">Time Spent</div>
            </div>
          </div>

          {totalXP > 0 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-center text-white mb-8">
              <Trophy className="w-10 h-10 mx-auto mb-3" />
              <div className="text-2xl font-bold">+{totalXP} XP Earned!</div>
              <div className="text-yellow-100">Great work on completing the {isInfiniteMode ? 'infinite practice' : mode}!</div>
            </div>
          )}

          {processedQuestions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                Question Review
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {processedQuestions.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl p-4 ${
                      item.isCorrect
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {item.isCorrect ? (
                          <CheckCircle className="text-white" size={16} />
                        ) : (
                          <XCircle className="text-white" size={16} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          Q{index + 1}: {item.question}
                        </p>
                        <div className="text-sm space-y-1">
                          <p className={`${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            Your answer: {item.skipped ? 'Skipped' : item.selected}
                          </p>
                          {!item.isCorrect && !item.skipped && (
                            <p className="text-green-700">
                              Correct answer: {item.correct}
                            </p>
                          )}
                          {mode === 'practice' && item.explanation && item.explanation !== 'No explanation available' && (
                            <p className="text-gray-600 mt-2 p-3 bg-white/50 rounded-lg">
                              {item.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <RotateCcw size={20} />
              {isInfiniteMode ? 'Practice Again' : 'Try Again'}
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              <Home size={20} />
              Go Home
            </button>
          </div>

          {percentage < 80 && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                💡 Tips to Improve
              </h3>
              <ul className="text-yellow-700 space-y-2 text-sm">
                <li>• Review the explanations for incorrect answers</li>
                <li>• Practice more questions on this topic</li>
                <li>• Focus on understanding concepts rather than memorizing</li>
                <li>• Take your time to read questions carefully</li>
                {isInfiniteMode && <li>• Try longer infinite practice sessions to improve consistency</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen;