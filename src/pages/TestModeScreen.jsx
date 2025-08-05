import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Flag, AlertCircle } from 'lucide-react';

const TestModeScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, topicName, subtopicName, type, quizParams } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate(-1);
    }
  }, [questions, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Test Mode</h1>
              <p className="text-blue-100 text-sm">{topicName} - {subtopicName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isTimeRunningOut ? 'bg-red-500/20 text-red-100' : 'bg-white/20'
            }`}>
              <Clock size={18} />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-blue-100">
          <div>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div>
            Answered: {getAnsweredCount()}/{questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-4">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-white shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  selectedAnswers[index]
                    ? 'bg-green-500 text-white'
                    : index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Test Instructions:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Answer all questions</li>
                  <li>• No feedback during test</li>
                  <li>• Submit before time runs out</li>
                  <li>• Review answers anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index);
                      const isSelected = selectedAnswers[currentQuestionIndex] === option;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                          className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                            }`}>
                              {optionLetter}
                            </span>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-500">
                      {selectedAnswers[currentQuestionIndex] ? '✓ Answered' : 'Not answered'}
                    </span>

                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Test?</h3>
            <p className="text-gray-600 mb-6">
              You have answered {getAnsweredCount()} out of {questions.length} questions. 
              Are you sure you want to submit your test?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestModeScreen;