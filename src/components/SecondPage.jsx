import React, { useRef, useState, useEffect } from "react";

const SecondPage = ({ onPreviousPage, onNextPage }) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbackTimer, setFeedbackTimer] = useState(0);

  // Get current video data
  const currentVideo = videos[currentVideoIndex] || null;
  
  // Load video data from JSON file
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch('/data/videoQuizzes.json');
        const data = await response.json();
        setVideos(data.videos);
        
        // Initialize answered state for all quizzes across all videos
        const initialAnsweredState = {};
        data.videos.forEach((video, videoIndex) => {
          video.quizzes.forEach((_, quizIndex) => {
            initialAnsweredState[`${videoIndex}-${quizIndex}`] = false;
          });
        });
        setQuizAnswered(initialAnsweredState);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading video data:", error);
        setLoading(false);
      }
    };

    fetchVideoData();
  }, []);

  // Reset video when changing to a new video
  useEffect(() => {
    if (!loading && videoRef.current && currentVideo) {
      // Reset video state
      videoRef.current.currentTime = 0;
      setVideoTime(0);
      setCurrentQuiz(null);
      
      // Set up metadata loaded handler to get duration
      const handleMetadata = () => {
        setVideoDuration(videoRef.current.duration);
        // Auto-play video once metadata is loaded
        videoRef.current.play().catch(error => {
          console.error("Video play error:", error);
          setVideoError(true);
        });
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleMetadata);
      
      // Clean up event listener
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
        }
      };
    }
  }, [loading, currentVideoIndex, currentVideo]);

  // Handle video ended - move to next video
  const handleVideoEnded = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prevIndex => prevIndex + 1);
    }
  };

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current || loading || !currentVideo) return;
    
    const currentTime = videoRef.current.currentTime;
    setVideoTime(currentTime);
    
    // Update progress bar
    if (progressRef.current && videoDuration > 0) {
      progressRef.current.value = (currentTime / videoDuration) * 100;
    }
    
    // Check if we should show a quiz
    if (currentQuiz === null) {
      const quizToShow = currentVideo.quizzes.findIndex((quiz, index) => {
        // Show quiz if we've reached its time and it hasn't been answered yet
        const quizKey = `${currentVideoIndex}-${index}`;
        return currentTime >= quiz.time && 
               currentTime < quiz.time + 0.5 && // Add small buffer to avoid triggering multiple times
               !quizAnswered[quizKey];
      });
      
      if (quizToShow !== -1) {
        videoRef.current.pause();
        setCurrentQuiz(quizToShow);
      }
    }
  };

  // Check for quizzes when seeking
  const checkForQuizzes = () => {
    if (!videoRef.current || loading || !currentVideo) return;
    
    const currentTime = videoRef.current.currentTime;
    
    // Check if we're at a quiz time point
    const quizToShow = currentVideo.quizzes.findIndex((quiz, index) => {
      const quizKey = `${currentVideoIndex}-${index}`;
      return Math.abs(currentTime - quiz.time) < 0.5 && !quizAnswered[quizKey];
    });
    
    if (quizToShow !== -1 && currentQuiz === null) {
      videoRef.current.pause();
      setCurrentQuiz(quizToShow);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (quizIndex, answerIndex) => {
    const quizKey = `${currentVideoIndex}-${quizIndex}`;
    
    // Update selected answer
    setSelectedAnswers(prev => ({
      ...prev,
      [quizKey]: answerIndex
    }));
    
    // Mark quiz as answered
    setQuizAnswered(prev => ({
      ...prev,
      [quizKey]: true
    }));
    
    // Set feedback timer (increased from 2s to 3s)
    setFeedbackTimer(5);
    
    // Start countdown to continue video
    const interval = setInterval(() => {
      setFeedbackTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Continue video
          if (videoRef.current) {
            setCurrentQuiz(null);
            videoRef.current.play();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Switch to a specific video
  const handleVideoSelect = (index) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
    }
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current || !videoDuration) return;
    
    const newTime = (e.target.value / 100) * videoDuration;
    videoRef.current.currentTime = newTime;
    setVideoTime(newTime);
    
    // Check if we landed on a quiz point
    checkForQuizzes();
  };

  // Format time in MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Manual play function for error recovery
  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setVideoError(false))
        .catch(err => console.error("Still unable to play:", err));
    }
  };

  // Get current quiz data if available
  const currentQuizData = (currentQuiz !== null && currentVideo) ? 
                          currentVideo.quizzes[currentQuiz] : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-xl">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-100 to-purple-200 p-4 overflow-hidden">
      <h1 className="text-2xl font-bold text-center mb-2">Parking Assistance</h1>
      
      {/* Main container - takes all available space without causing scroll */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with video list */}
        <div className="w-1/5 bg-white rounded-l-xl shadow-lg p-2 mr-2 overflow-y-auto">
          <h2 className="font-semibold text-lg pb-2 border-b border-gray-200 mb-2">Videos</h2>
          <ul className="space-y-1">
            {videos.map((video, index) => (
              <li key={index}>
                <button
                  onClick={() => handleVideoSelect(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    index === currentVideoIndex
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {video.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Video section - made smaller with max height constraint */}
          <div className="w-full bg-white rounded-r-xl shadow-lg p-3 mb-3">
            {currentVideo && (
              <>
                {/* Replace the video wrapper div with these lines */}
					<div className="relative mx-auto bg-black rounded-lg overflow-hidden" style={{ maxWidth: '70%', maxHeight: '60vh' }}>
					<div className="aspect-video">
						<video 
						ref={videoRef}
						className="w-full h-full object-contain"
						onTimeUpdate={handleTimeUpdate}
						onEnded={handleVideoEnded}
						onError={() => setVideoError(true)}
						src={`/videos/${currentVideo.filename}`}
						playsInline
						muted
						/>
					</div>
                  
                  {/* Video error message */}
                  {videoError && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-4">
                      <p className="mb-2 text-center">Unable to load or play the video</p>
                      <button 
                        onClick={handleManualPlay}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                      >
                        Try to Play
                      </button>
                    </div>
                  )}
                  
                  {/* Pause indicator overlay */}
                  {currentQuiz !== null && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg flex items-center space-x-2 transform rotate-3 hover:rotate-0 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                        <span className="font-bold text-blue-800">Quiz Time!</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Replace the progress bar section with these lines */}
					<div className="mt-2 mx-auto" style={{ maxWidth: '70%' }}>
					<div className="flex items-center">
						<span className="text-xs text-gray-600 w-10">{formatTime(videoTime)}</span>
						<input
						ref={progressRef}
						type="range"
						min="0"
						max="100"
						value={(videoTime / Math.max(1, videoDuration)) * 100}
						onChange={handleProgressChange}
						className="flex-1 mx-2 h-2 rounded-full appearance-none bg-gray-300 focus:outline-none cursor-pointer"
						style={{
							background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(videoTime / Math.max(1, videoDuration)) * 100}%, #d1d5db ${(videoTime / Math.max(1, videoDuration)) * 100}%, #d1d5db 100%)`
						}}
						/>
						<span className="text-xs text-gray-600 w-10">{formatTime(videoDuration)}</span>
					</div>
                </div>
              </>
            )}
          </div>
          
          {/* Quiz and result section with adequate space */}
          <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto pb-2">
            {/* Quiz section */}
            {currentQuiz !== null && currentQuizData && (
              <div className="w-4/5 max-w-2xl bg-blue-50 rounded-xl p-3 shadow-inner mb-3">
                <h2 className="text-lg font-semibold text-center mb-3">{currentQuizData.question}</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentQuizData.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuiz, index)}
                      className="bg-white hover:bg-blue-100 border-2 border-blue-200 text-blue-800 py-2 px-4 rounded-lg shadow transition-colors text-sm max-w-[220px] text-center"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Result section */}
            {currentQuiz !== null && quizAnswered[`${currentVideoIndex}-${currentQuiz}`] && currentQuizData && (
              <div className={`w-4/5 max-w-2xl rounded-xl p-3 shadow-inner text-center ${
                selectedAnswers[`${currentVideoIndex}-${currentQuiz}`] === currentQuizData.correctOption 
                  ? 'bg-green-50' 
                  : 'bg-red-50'
              }`}>
                <h2 className="text-lg font-semibold">
                  {selectedAnswers[`${currentVideoIndex}-${currentQuiz}`] === currentQuizData.correctOption 
                    ? '✓ Correct!' 
                    : '✗ Incorrect!'}
                </h2>
                {selectedAnswers[`${currentVideoIndex}-${currentQuiz}`] !== currentQuizData.correctOption && (
                  <p className="text-sm mt-1">
                    <span className="font-semibold">The correct answer is:</span> {currentQuizData.options[currentQuizData.correctOption]}
                  </p>
                )}
                {feedbackTimer > 0 && (
                  <p className="text-xs mt-2 text-gray-500">Continuing in {feedbackTimer}s...</p>
                )}
              </div>
            )}
          </div>
          
          {/* Back button container */}
          <div className="flex justify-between mt-4">
			<button
			onClick={onPreviousPage}
			className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
			>
			Previous
			</button>
			<button
			onClick={onNextPage}
			className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
			>
			Next
			</button>
		</div>
        </div>
      </div>
    </div>
  );
};

export default SecondPage;
