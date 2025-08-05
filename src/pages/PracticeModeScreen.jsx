import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, BookOpen } from 'lucide-react';

const PracticeModeScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, topicName, subtopicName, type, quizParams } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate(-1);
    }
  }, [questions, navigate]);

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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion.question,
      selected: answer,
      correct: currentQuestion.correct_answer,
      isCorrect: correct,
      explanation: currentQuestion.explanation,
      hint: currentQuestion.hint
    }]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Navigate to results
      navigate('/quiz-result', {
        state: {
          mode: 'practice',
          topicName,
          subtopicName,
          totalQuestions: questions.length,
          correctAnswers: score,
          questionHistory: answeredQuestions,
          type,
          quizParams
        }
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Practice Mode</h1>
              <p className="text-green-100 text-sm">{topicName} - {subtopicName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-green-100">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm text-green-100">
            Score: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-4">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Question */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";
                    
                    if (!showFeedback) {
                      buttonClass += selectedAnswer === option
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50";
                    } else {
                      if (option === currentQuestion.correct_answer) {
                        buttonClass += "border-green-500 bg-green-100 text-green-800";
                      } else if (option === selectedAnswer) {
                        buttonClass += "border-red-500 bg-red-100 text-red-800";
                      } else {
                        buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                      }
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={buttonClass}
                        disabled={showFeedback}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                            {optionLetter}
                          </span>
                          <span>{option}</span>
                          {showFeedback && option === currentQuestion.correct_answer && (
                            <CheckCircle className="text-green-600 ml-auto" size={20} />
                          )}
                          {showFeedback && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                            <XCircle className="text-red-600 ml-auto" size={20} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`rounded-2xl shadow-md p-6 mb-6 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {isCorrect ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className={`mb-4 ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {currentQuestion.explanation}
                  </p>
                  
                  {/* Hint */}
                  {currentQuestion.hint && (
                    <div className="bg-white/50 rounded-lg p-3 border border-white/50">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="text-yellow-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Hint:</p>
                          <p className="text-sm text-gray-600">{currentQuestion.hint}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showFeedback && (
            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                {isLastQuestion ? 'View Results' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeModeScreen;