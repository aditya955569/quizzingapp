'use client'
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Link from 'next/link';

type Question = {
  category: string;
  question: {
    text: string;
  };
  correctAnswer: string;
  incorrectAnswers: string[];
};
export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [finalOptions, setFinalOptions] = useState<string[]>([]);
  const [timer, setTimer] = useState(10);
  const [rightAnswer, setRightAnswer] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [noAnswerSelected, setNoAnswerSelected] = useState(false);
  const [quizOver, setQuizOver] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [correctAnswers,setCorrectAnswers]=useState(0);
  const [notAttempted,setNotAttempted]=useState(0);
  const [incorrectAnswers,setIncorrectAnswers]=useState(0);
  const [showStats, setShowStats] = useState(false);
  let tempOptions = [];
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };
  function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const getQuestions = useCallback(async () => {
    try {
      const response = await axios.get("https://the-trivia-api.com/v2/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getQuestions();
  }, [getQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[index];
      setCategory(currentQuestion.category);
      setQuestionText(currentQuestion.question.text);
      setQuestionAnswer(currentQuestion.correctAnswer);
      setFinalOptions(shuffleArray([currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers]));
      setIsTimerActive(true);
      setTimer(10);
    }
  }, [questions, index]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    if (isTimerActive) {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(timerInterval);
            handleSubmit();
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isTimerActive]);

  const handleNextQuestion = useCallback(() => {
    if (index + 1 >= questions.length) {
      setQuizOver(true);
      return;
    }
    setRightAnswer(false);
    setWrongAnswer(false);
    setNoAnswerSelected(false);
    setSelectedAnswer("");
    setIndex(index + 1);
    setIsTimerActive(true);
  }, [index, questions.length]);

  const handleSubmit = useCallback(() => {
    setIsTimerActive(false);

    if (!selectedAnswer) {
      setNotAttempted(notAttempted+1);
      setNoAnswerSelected(true);
    } else {
      if (selectedAnswer === questionAnswer) {
        setRightAnswer(true);
        setCorrectAnswers(prev => prev + 1);
      } else {
        setWrongAnswer(true);
        setIncorrectAnswers(prev => prev + 1);
      }
    }

    setShowStats(true);
    setTimeout(() => {
      setShowStats(false);
      handleNextQuestion();
    }, 3000);
  }, [selectedAnswer, questionAnswer, handleNextQuestion]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      {isAuthenticated ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
          {quizOver ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Over!</h2>
              <p className="text-lg text-gray-700">Thanks for playing.</p>
              <div className="mt-4 text-gray-600">
                <p>Correct Answers: {correctAnswers}</p>
                <p>Incorrect Answers: {incorrectAnswers}</p>
                <p>Not Attempted: {notAttempted}</p>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </motion.div>
          ) : (
            <>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded bg-blue-100 text-blue-800"
                >
                  <p>Correct Answers: {correctAnswers}</p>
                  <p>Incorrect Answers: {incorrectAnswers}</p>
                  <p>Not Attempted: {notAttempted}</p>
                </motion.div>
              )}
              {(noAnswerSelected || wrongAnswer || rightAnswer) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded ${
                    noAnswerSelected ? 'bg-yellow-100 text-yellow-800' :
                    wrongAnswer ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {noAnswerSelected && 'No answer was selected.'}
                  {wrongAnswer && 'Your answer is incorrect.'}
                  {rightAnswer && 'Your answer is correct.'}
                </motion.div>
              )}
              {questions.length > 0 && !noAnswerSelected && !rightAnswer && !wrongAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-500">Question {index + 1}/{questions.length}</span>
                    <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                  </div>
                  <p className="text-lg mb-6 text-gray-700">{questionText}</p>
                  <div className="space-y-3">
                    {finalOptions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnswer(item)}
                        className={`w-full p-3 text-left rounded transition-colors ${
                          selectedAnswer === item
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">
                      Time left: {timer}s
                    </div>
                    {selectedAnswer && (
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Welcome to the Quiz App</h2>
          <p className="text-lg text-white mb-4">Please log in or sign up to start the quiz.</p>
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// ... existing shuffleArray function ...