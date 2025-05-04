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
      <div className="w-full max-w-lg">
        <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-4 relative">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold">
            {progress}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl">
          {!showFinalScore ? (
            questions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">
                  Q{current + 1}: {questions[current].question}
                </h3>
                
                <div className="space-y-3 mb-4">
                  {questions[current].options.map((option, index) => (
                    <label 
                      key={index} 
                      className={`block p-3 bg-gray-100 rounded-lg cursor-pointer border-2 transition-all
                        ${questions[current].selectedOption === index ? 'border-black' : 'border-transparent'}`}
                      onClick={() => handleOptionSelect(current, index)}
                    >
                      <span className="pl-2 block text-left">{option}</span>
                    </label>
                  ))}
                </div>
                
                <button 
                  onClick={handleNext}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )
          ) : (
            <div>
              <div className="text-2xl font-bold mb-6">
                You scored {score} out of {questions.length}!
              </div>
              
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-3">{q.question}</h3>
                    
                    <div className="space-y-2">
                      {q.options.map((option, oIndex) => (
                        <div 
                          key={oIndex}
                          className={`p-2 rounded-lg ${
                            oIndex === q.answer ? 'bg-green-100 border-2 border-green-500' :
                            oIndex === q.selectedOption ? 'bg-red-100 border-2 border-red-500' :
                            'bg-gray-100'
                          }`}
                        >
                          <span className="pl-2">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={onPreviousPage}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThirdPage;