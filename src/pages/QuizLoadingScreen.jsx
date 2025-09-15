import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizService from '../services/QuizService';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

const QuizLoadingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, type, quizParams, topicName, subtopicName } = location.state || {};

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showFadeOut, setShowFadeOut] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const isCancelledRef = useRef(false);

  const practiceLoadingMessages = [
    "Analyzing your learning style...",
    "Preparing adaptive questions...",
    "Optimizing your practice environment...",
    "Customizing difficulty levels...",
    "Setting up instant feedback system...",
    "Ready to start practicing!"
  ];

  const testLoadingMessages = [
    "Preparing test environment...",
    "Generating comprehensive questions...",
    "Calibrating difficulty levels...",
    "Setting up timed challenges...",
    "Preparing performance analytics...",
    "Ready to begin your test!"
  ];

  const currentMessages = mode === 'test' ? testLoadingMessages : practiceLoadingMessages;

  useEffect(() => {
    if (!mode || !type || !quizParams) {
      navigate(-1);
      return;
    }

    // Only start generation once
    if (!hasGenerated && !isGenerating) {
      setHasGenerated(true);
      startQuizGeneration();
      startLoadingAnimation();
    }
  }, []); // Empty dependency array to run only once

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 QUIZ LOADING: Component unmounting, cleaning up...');
      setIsCancelled(true);
      if (abortController) {
        abortController.abort();
        console.log('🚫 QUIZ LOADING: Aborting on unmount...');
      }
    };
  }, [abortController]);

  const startLoadingAnimation = () => {
    const stepDuration = mode === 'test' ? 2500 : 2500;
    const maxSteps = currentMessages.length - 2; // Don't auto-complete to final step

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
    if (isGenerating) return; // Prevent multiple calls
    
    // Create abort controller for cancelling requests
    const controller = new AbortController();
    setAbortController(controller);
    
    setIsGenerating(true);
    setHasError(false);

    try {
      let questions;

      console.log('📡 QUIZ LOADING: Starting API call with params:', { mode, type, quizParams });
      console.log('🔍 QUIZ LOADING: AbortController signal created:', !!controller.signal);

      if (mode === 'practice') {
        console.log('🎯 QUIZ LOADING: Calling generatePracticeQuestions...');
        questions = await QuizService.generatePracticeQuestions({
          type,
          params: quizParams,
          signal: controller.signal
        });
        console.log(`✅ QUIZ LOADING: Generated ${questions.length} questions for practice mode`);
      } else {
        console.log('🎯 QUIZ LOADING: Calling generateTestQuestions...');
        questions = await QuizService.generateTestQuestions({
          type,
          params: quizParams,
          signal: controller.signal
        });
        console.log(`✅ QUIZ LOADING: Generated ${questions.length} questions for test mode`);
      }
      
      // Check cancellation immediately after API call
      if (isCancelled || isCancelledRef.current) {
        console.log('🚫 QUIZ LOADING: API completed but user cancelled, discarding results');
        console.log('🔍 QUIZ LOADING: Post-API cancellation state:', { isCancelled, isCancelledRef: isCancelledRef.current });
        return;
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

      // Check if user cancelled before proceeding (using ref for immediate access)
      if (isCancelled || isCancelledRef.current) {
        console.log('🚫 QUIZ LOADING: Generation completed but user cancelled, not navigating');
        console.log('🔍 QUIZ LOADING: Cancellation state:', { isCancelled, isCancelledRef: isCancelledRef.current });
        return;
      }
      
      // Complete progress to 100% and show fade out animation
      setCurrentStep(currentMessages.length - 1); // Set to final step
      
      setTimeout(() => {
        // Check cancellation again before fade out
        if (isCancelled || isCancelledRef.current) {
          console.log('🚫 QUIZ LOADING: User cancelled during completion, not navigating');
          console.log('🔍 QUIZ LOADING: Cancellation state at fade out:', { isCancelled, isCancelledRef: isCancelledRef.current });
          return;
        }
        
        setShowFadeOut(true);
        
        // Navigate after fade out animation
        setTimeout(() => {
          // Final cancellation check before navigation
          if (isCancelled || isCancelledRef.current) {
            console.log('🚫 QUIZ LOADING: User cancelled during fade out, not navigating');
            console.log('🔍 QUIZ LOADING: Final cancellation state:', { isCancelled, isCancelledRef: isCancelledRef.current });
            return;
          }
          
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
        }, 800); // Wait for fade out animation
      }, 1000); // Show 100% for 1 second

    } catch (error) {
      // Don't show error if request was aborted (user pressed back)
      if (error.name === 'AbortError') {
        console.log('🚫 QUIZ LOADING: Question generation cancelled by user (AbortError caught)');
        console.log('🔍 QUIZ LOADING: Error cancellation state:', { isCancelled, isCancelledRef: isCancelledRef.current });
        return;
      }
      
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
      setAbortController(null);
    }
  };

  const handleRetry = () => {
    console.log('🔄 QUIZ LOADING: User clicked retry, resetting state...');
    setCurrentStep(0);
    setHasGenerated(false);
    setIsCancelled(false); // Reset cancellation state
    isCancelledRef.current = false; // Reset ref too
    setHasError(false);
    setTimeout(() => {
      setHasGenerated(true);
      startQuizGeneration();
      startLoadingAnimation();
    }, 100);
  };

  const handleGoBack = () => {
    console.log('🔙 QUIZ LOADING: User pressed back button, cancelling...');
    
    // Mark as cancelled first to prevent any navigation (both state and ref)
    setIsCancelled(true);
    isCancelledRef.current = true;
    
    console.log('🚫 QUIZ LOADING: Set cancellation flags:', { isCancelled: true, isCancelledRef: true });
    
    // Cancel ongoing question generation
    if (abortController) {
      abortController.abort();
      console.log('🚫 QUIZ LOADING: Aborting ongoing question generation...');
    } else {
      console.log('⚠️ QUIZ LOADING: No abortController found to cancel');
    }
    
    // Navigate back to the list topics page with the same category info
    if (location.state?.quizParams?.categoryId && location.state?.quizParams?.subcategory) {
      navigate(`/list-topics/${encodeURIComponent(location.state.quizParams.categoryId)}`, {
        state: {
          categoryName: location.state.quizParams.categoryId,
          categoryIcon: '🌐' // Default icon, could be passed from state if available
        }
      });
    } else {
      // Fallback to previous page
      navigate(-1);
    }
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
    <div 
      className={`transition-opacity duration-800 ${showFadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #2E0059 0%, #4B007D 50%, #F871A0 100%)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Background Effects */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div 
          className="animate-pulse"
          style={{
            position: 'absolute',
            top: '-5rem',
            right: '-5rem',
            width: '10rem',
            height: '10rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%'
          }}
        ></div>
        <div 
          className="animate-pulse"
          style={{
            position: 'absolute',
            bottom: '-2.5rem',
            left: '-2.5rem',
            width: '8rem',
            height: '8rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="animate-ping"
          style={{
            position: 'absolute',
            top: '33%',
            left: '25%',
            width: '0.5rem',
            height: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            animationDelay: '1s'
          }}
        ></div>
        <div 
          className="animate-ping"
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '33%',
            width: '0.25rem',
            height: '0.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            animationDelay: '3s'
          }}
        ></div>
      </div>
      
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
        <button
          onClick={handleGoBack}
          className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          padding: '2rem'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '64rem', width: '100%' }}>
          
          {/* Circular Animated Loader */}
          <div style={{ position: 'relative', width: '4rem', height: '4rem', margin: '0 auto 2rem' }}>
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px solid rgba(255, 255, 255, 0.2)'
              }}
            ></div>
            <div 
              className="animate-spin"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px solid white',
                borderTopColor: 'transparent'
              }}
            ></div>
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div 
                className="animate-pulse"
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '50%'
                }}
              ></div>
            </div>
          </div>

          {/* Rotating Splash Text */}
          <div style={{ marginBottom: '2rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 
              className="transition-all duration-700 ease-in-out transform"
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: '500', 
                color: 'rgba(255, 255, 255, 0.9)' 
              }}
            >
              {currentMessages[currentStep]}
            </h2>
          </div>

          {/* Main Title */}
          <h1 
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '3rem' 
            }}
          >
            Setting up practice environment...
          </h1>

          {/* Dynamic Progress Bar */}
          <div style={{ position: 'relative', maxWidth: '32rem', margin: '0 auto 4rem' }}>
            <div 
              style={{
                width: '100%',
                height: '1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '9999px',
                overflow: 'hidden',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div
                className="transition-all duration-1000 ease-out shadow-lg"
                style={{ 
                  height: '100%',
                  background: 'linear-gradient(to right, white, #fbb6ce, white)',
                  borderRadius: '9999px',
                  width: `${((currentStep + 1) / currentMessages.length) * 100}%`,
                  position: 'relative'
                }}
              >
                <div 
                  className="animate-pulse"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)'
                  }}
                ></div>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>
              {Math.round(((currentStep + 1) / currentMessages.length) * 100)}% Complete
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Mode Card */}
      <div 
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1rem',
            padding: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
            {mode === 'practice' ? (
              <BookOpen className="text-white" size={20} />
            ) : (
              <Clock className="text-white" size={20} />
            )}
            <span style={{ fontWeight: '500' }}>
              {mode === 'practice' ? 'Practice Mode' : 'Test Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLoadingScreen;