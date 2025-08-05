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
    questionHistory,
    type,
    quizParams,
    timeSpent
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

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
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
    navigate('/quiz-loading', {
      state: {
        mode,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className={`${isPassed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-600 to-red-600'} text-white p-8`}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'practice' ? 'Practice Complete!' : 'Test Complete!'}
          </h1>
          <p className="text-lg opacity-90">{topicName} - {subtopicName}</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <div className="mb-6">
              <div className={`text-6xl font-bold mb-2 ${performance.color}`}>
                {percentage}%
              </div>
              <p className={`text-xl font-semibold ${performance.color}`}>
                {performance.message}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <Target className="text-blue-600 mx-auto mb-2" size={24} />
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold text-blue-600">
                  {correctAnswers}/{totalQuestions}
                </p>
              </div>

              {timeSpent && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <Clock className="text-purple-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatTime(timeSpent)}
                  </p>
                </div>
              )}

              {totalXP && (
                <div className="bg-green-50 rounded-xl p-4">
                  <Trophy className="text-green-600 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">XP Earned</p>
                  <p className="text-xl font-bold text-green-600">
                    {totalXP} XP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questionHistory?.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
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
                          Your answer: {item.selected || 'Not answered'}
                        </p>
                        {!item.isCorrect && (
                          <p className="text-green-700">
                            Correct answer: {item.correct}
                          </p>
                        )}
                        {mode === 'practice' && item.explanation && (
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              <Home size={20} />
              Go Home
            </button>
          </div>

          {/* Performance Tips */}
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
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen;