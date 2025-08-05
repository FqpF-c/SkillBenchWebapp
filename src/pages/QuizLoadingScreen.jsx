import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizService from '../services/QuizService';
import { ArrowLeft } from 'lucide-react';

const QuizLoadingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, type, quizParams, topicName, subtopicName } = location.state || {};

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const practiceLoadingMessages = [
    "Initializing practice session...",
    "Analyzing your learning preferences...",
    "Selecting optimal questions...",
    "Preparing adaptive content...",
    "Setting up practice environment...",
    "Ready to start practicing!"
  ];

  const testLoadingMessages = [
    "Preparing test environment...",
    "Generating comprehensive questions...",
    "Calibrating difficulty levels...",
    "Setting up timed challenges...",
    "Preparing performance analytics...",
    "Optimizing test experience...",
    "Ready to begin your test!"
  ];

  const currentMessages = mode === 'test' ? testLoadingMessages : practiceLoadingMessages;

  useEffect(() => {
    if (!mode || !type || !quizParams) {
      navigate(-1);
      return;
    }

    startQuizGeneration();
    startLoadingAnimation();
  }, [mode, type, quizParams]);

  const startLoadingAnimation = () => {
    const stepDuration = mode === 'test' ? 3000 : 3000;
    const maxSteps = currentMessages.length - 1;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < maxSteps) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, stepDuration);

    return () => clearInterval(interval);
  };

  const startQuizGeneration = async () => {
    setIsGenerating(true);
    setHasError(false);

    try {
      let questions;

      console.log('Generating questions with params:', { mode, type, quizParams });

      if (mode === 'practice') {
        questions = await QuizService.generatePracticeQuestions({
          type,
          params: quizParams,
        });
        console.log(`Generated ${questions.length} questions for practice mode`);
      } else {
        questions = await QuizService.generateTestQuestions({
          type,
          params: quizParams,
        });
        console.log(`Generated ${questions.length} questions for test mode`);
      }

      questions = QuizService.validateQuestions(questions);
      console.log(`Validated questions: ${questions.length} valid questions`);

      if (questions.length === 0) {
        throw new Error('No valid questions generated');
      }

      const minQuestions = mode === 'practice' ? 5 : 10;
      if (questions.length < minQuestions) {
        throw new Error(`Insufficient questions generated: ${questions.length}/${minQuestions}`);
      }

      // Navigate to the appropriate quiz screen
      setTimeout(() => {
        if (mode === 'practice') {
          navigate('/practice-mode', {
            state: {
              questions,
              topicName,
              subtopicName,
              type,
              quizParams
            }
          });
        } else {
          navigate('/test-mode', {
            state: {
              questions,
              topicName,
              subtopicName,
              type,
              quizParams
            }
          });
        }
      }, 1500);

    } catch (error) {
      console.error('Quiz generation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        mode,
        type,
        quizParams
      });
      setHasError(true);
      setErrorMessage(error.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setCurrentStep(0);
    startQuizGeneration();
    startLoadingAnimation();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-red-500 text-4xl">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Generation Failed</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'practice' ? 'Preparing Practice' : 'Preparing Test'}
            </h1>
            <p className="text-purple-100">{topicName} - {subtopicName}</p>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          {/* Animated Loading Circle */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Loading Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {currentMessages[currentStep]}
          </h2>

          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / currentMessages.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Counter */}
          <p className="text-gray-500 text-sm mb-8">
            Step {currentStep + 1} of {currentMessages.length}
          </p>

          {/* Loading Steps */}
          <div className="space-y-3">
            {currentMessages.map((message, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-purple-500 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-sm font-medium">{message}</span>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">🚀</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {mode === 'practice' ? 'Practice Mode' : 'Test Mode'}
                </h4>
                <p className="text-gray-600 text-xs">
                  {mode === 'practice'
                    ? 'Questions are being optimized for your learning pace'
                    : 'Comprehensive test questions are being prepared'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLoadingScreen;