'use client'
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [finalOptions, setFinalOptions] = useState([]);
  const [timer, setTimer] = useState(10);
  const [rightAnswer, setRightAnswer] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [noAnswerSelected, setNoAnswerSelected] = useState(false);
  const [quizOver, setQuizOver] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [correctAnswers,setCorrectAnswers]=useState(0);
  const [notAttempted,setNotAttempted]=useState(0);
  const [incorrectAnswers,setIncorrectAnswers]=useState(0);
  let tempOptions = [];

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const getQuestions = async () => {
    try {
      const response = await axios.get("https://the-trivia-api.com/v2/questions");
      setQuestions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setCategory(questions[index].category);
      setQuestionText(questions[index].question.text);
      setQuestionAnswer(questions[index].correctAnswer);
      tempOptions = [
        questions[index].correctAnswer,
        ...questions[index].incorrectAnswers,
      ];
      setFinalOptions(shuffleArray(tempOptions));
      setIsTimerActive(true); // Start the timer only after the question is fully loaded
      setTimer(10); // Reset timer to 10 seconds
    }
  }, [questions, index]);

  useEffect(() => {
    let timerInterval;
    if (isTimerActive) {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(timerInterval); // Stop the timer at 0
            handleSubmit(); // Automatically submit the answer when timer reaches 0
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval); // Cleanup on unmount or when re-running
  }, [isTimerActive]);

  const handleNextQuestion = () => {
    if (index + 1 >= questions.length) {
      setQuizOver(true);
      return;
    }
    setRightAnswer(false);
    setWrongAnswer(false);
    setNoAnswerSelected(false);
    setSelectedAnswer("");
    setIndex(index + 1);
    setIsTimerActive(true); // Restart the timer for the next question
  };

  const handleSubmit = () => {
    setIsTimerActive(false); // Stop the timer

    if (!selectedAnswer) {
      setNotAttempted(notAttempted+1)
      setNoAnswerSelected(true); // Show message if no answer is selected
    } else {
      if (selectedAnswer === questionAnswer) {
        setRightAnswer(true);
        setCorrectAnswers(correctAnswers+1);
        console.log("correct");
      } else {
        setWrongAnswer(true);
        setIncorrectAnswers(incorrectAnswers+1);
        console.log("wrong");
      }
    }

    setTimeout(handleNextQuestion, 2000); // Move to the next question after 2 seconds
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div>Correct Answers {correctAnswers}</div>
      <div>Incorrect Answers {incorrectAnswers}</div>
      <div>Not attempted {notAttempted}</div>
      {quizOver ? (
        <div>The quiz is over! Thanks for playing.</div>
      ) : (
        <>
          {noAnswerSelected && <div>No answer was selected.</div>}
          {wrongAnswer && <div>Your answer is incorrect.</div>}
          {rightAnswer && <div>Your answer is correct.</div>}
          {questions.length > 0 && !noAnswerSelected && !rightAnswer && !wrongAnswer && (
            <div>
              <div>{index+1}</div>
              <div>{category}</div>
              <div>{questionText}</div>
              <div className="flex flex-col">
                {finalOptions &&
                  finalOptions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAnswer(item);
                      }}
                      className={selectedAnswer==item?"bg-blue-500 text-white mt-10 py-3" : "bg-gray-200 mt-10 py-3"}
                    >
                      {item}
                    </button>
                  ))}
              </div>
              <div>Time left: {timer}s</div>
              {selectedAnswer!=''&&
              <button onClick={handleSubmit}>
                Submit
              </button>
              }
            </div>
          )}
        </>
      )}
    </main>
  );
}
