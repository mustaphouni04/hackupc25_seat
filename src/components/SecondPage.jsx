import React from "react";

const SecondPage = ({ onPreviousPage }) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-6">Hello World</h1>
      
      {/* Empty second page content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 h-[80vh]">
        <p className="text-xl text-center">This is the second page</p>
      </div>

      {/* Back button */}
      <div className="flex justify-start mt-4">
        <button
          onClick={onPreviousPage}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          Back
        </button>
      </div>
    </>
  );
};

export default SecondPage;
