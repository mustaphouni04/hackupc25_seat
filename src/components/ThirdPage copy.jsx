import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const ThirdPage = ({ onPreviousPage }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sample questions data
  const sampleQuestions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Rome", "Madrid"],
      answer: 0,
      selectedOption: null,
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Venus", "Mars", "Jupiter"],
      answer: 2,
      selectedOption: null,
    },
    {
      question: "Who wrote 'To be, or not to be'?",
      options: ["Shakespeare", "Hemingway", "Dickens", "Orwell"],
      answer: 0,
      selectedOption: null,
    }
  ];

  useEffect(() => {
    // Randomize and set questions
    const count = sampleQuestions.length;
    const used = new Set();
    const randomizedQuestions = [];

    for (let i = 0; i < count; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * sampleQuestions.length);
      } while (used.has(index));
      used.add(index);
      randomizedQuestions.push({...sampleQuestions[index]});
    }

    setQuestions(randomizedQuestions);
  }, []);

  useEffect(() => {
    // Update progress whenever current question changes
    if (questions.length > 0) {
      setProgress(Math.round((current / questions.length) * 100));
    }
  }, [current, questions.length]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        selectedOption: optionIndex
      };
      return updatedQuestions;
    });
  };

  const handleNext = () => {
    const currentQuestion = questions[current];
    
    if (currentQuestion.selectedOption === null) {
      alert('Please select an option');
      return;
    }

    if (currentQuestion.selectedOption === currentQuestion.answer) {
      setScore(prevScore => prevScore + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(prevCurrent => prevCurrent + 1);
    } else {
      setShowFinalScore(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Quiz Challenge</h1>
        
        <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden mb-6 relative shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white h-full flex items-center justify-center">
            {progress}% Complete
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100">
          {!showFinalScore ? (
            questions.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  Question {current + 1} of {questions.length}
                </h3>
                <p className="text-xl mb-6 text-gray-700">
                  {questions[current].question}
                </p>
                
                <div className="space-y-4 mb-8">
                  {questions[current].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl cursor-pointer transform transition-all duration-200 hover:scale-[1.01] ${
                        questions[current].selectedOption === index 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-400 shadow-md' 
                          : 'bg-gray-50 border border-gray-200 hover:border-purple-200'
                      }`}
                      onClick={() => handleOptionSelect(current, index)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          questions[current].selectedOption === index 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg text-gray-700">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleNext}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md font-semibold"
                >
                  {current === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            )
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="text-3xl font-bold mb-4 text-purple-800">
                  Quiz Completed!
                </div>
                <div className="text-2xl font-semibold mb-8">
                  You scored <span className="text-blue-600">{score}</span> out of <span className="text-purple-600">{questions.length}</span>
                </div>
                
                {score === questions.length ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
                    Perfect score! Congratulations! 🎉
                  </div>
                ) : score >= questions.length / 2 ? (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-200">
                    Good job! You passed the quiz! 👍
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6 border border-yellow-200">
                    Keep practicing to improve your score! 📚
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4">Review Your Answers</h3>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                    <h3 className="font-semibold mb-3 text-lg">{qIndex + 1}. {q.question}</h3>
                    
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={`p-3 rounded-lg flex items-center ${
                            oIndex === q.answer && oIndex === q.selectedOption 
                              ? 'bg-green-100 border-2 border-green-500' :
                            oIndex === q.answer 
                              ? 'bg-green-50 border-2 border-green-500' :
                            oIndex === q.selectedOption 
                              ? 'bg-red-100 border-2 border-red-500' :
                            'bg-gray-100'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                            oIndex === q.answer ? 'bg-green-500 text-white' : 
                            oIndex === q.selectedOption ? 'bg-red-500 text-white' : 
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <span className="pl-2">{option}</span>
                          
                          {oIndex === q.answer && (
                            <span className="ml-auto text-green-600">✓ Correct</span>
                          )}
                          {oIndex === q.selectedOption && oIndex !== q.answer && (
                            <span className="ml-auto text-red-600">✗ Your answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={onPreviousPage}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300"
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThirdPage;