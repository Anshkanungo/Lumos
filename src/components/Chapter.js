import React, { useState, useEffect } from "react";
import TestDataDisplay from "./Test";
import { Speak } from "./speechUtils";

const Chapter = () => {
  const [userInput, setUserInput] = useState("can you briefly explain the simplified version of this text?");
  const [response, setResponse] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [contentChunks, setContentChunks] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [selectMode, setSelectMode] = useState(false);


  const handleDataFetched = (data) => {
    setFileContent(data);
    const chunks = data.split(/\.\s*/g).filter(Boolean).map((chunk) => `${chunk}.`);
    setContentChunks(chunks);
  };

  const handlePrev = () => {
    if (highlightedIndex > 0) {
      const prevChunk = contentChunks[highlightedIndex - 1];
      Speak(prevChunk); // Speak the current chunk
      setHighlightedIndex(highlightedIndex - 1);
      if (selectMode) {
        setSelectedChunks((prevSelectedChunks) =>
          prevSelectedChunks.slice(0, highlightedIndex)
        );
      }
    }
    navigator.vibrate([200]);
  };
  

  const handleNext = () => {
    if (highlightedIndex < contentChunks.length - 1) {
      const nextChunk = contentChunks[highlightedIndex + 1];
      Speak(nextChunk); // Speak the current chunk
      setHighlightedIndex(highlightedIndex + 1);
      if (selectMode) {
        setSelectedChunks((prevSelectedChunks) => [
          ...prevSelectedChunks,
          nextChunk,
        ]);
      }
    }
    navigator.vibrate([300]);
  };
  

  const handleSelect = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedChunks([]);
    } else {
      setSelectedChunks([contentChunks[highlightedIndex]]);
    }
    navigator.vibrate([600]);
  };

  const handleMeta = () => {
    const selectedText = selectedChunks.join(" ");
    var newInput = `${userInput} ${selectedText}`;
    setSelectedChunks([]);
    setSelectMode(false);
    console.log("user input",userInput)
    console.log("new input",newInput)
    fetchOpenAIResponse(newInput)
    setUserInput(newInput);
    navigator.vibrate([700]);
    setUserInput("")
    newInput = "";
  };

  const fetchOpenAIResponse = (input) => {
    fetch("https://api.openai.com/v1/chat/completions", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPEN_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "system", content: input }],
        model: "gpt-3.5-turbo",
        max_tokens: 4000,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data.choices[0].message.content);
        Speak(data.choices[0].message.content)
      })
      .catch((error) => console.log(error));
    
  };

  const renderContent = () => {
    return fileContent.split(/\n/).map((line, index) => (
      <div key={index}>
        {line.split(/\.\s*/).map((chunk, chunkIndex) => (
          
          <span
            key={`${index}-${chunkIndex}`}
            style={{
              backgroundColor:
                contentChunks[highlightedIndex] === `${chunk}.`
                  ? "yellow"
                  : selectedChunks.includes(`${chunk}.`)
                  ? "lightgreen"
                  : "transparent",

            }}
          >
            {chunk}
            {chunkIndex !== line.split(/\.\s*/).length - 1 && "."}
          </span>
        ))}
        <br />
        
      </div>
    ));
  };

  return (
    <div>
      <h1>This is chapter</h1>
      <TestDataDisplay onDataFetched={handleDataFetched} />
      <div>
        <h2>User Input</h2>
        {userInput}
      </div>
      <div>
        <h2>API Response</h2>
        {response}
      </div>
      <div>
        <h2>File Content</h2>
        {renderContent()}
        <div>
          <button onClick={handlePrev}>Prev</button>
          <button onClick={handleNext}>Next</button>
          <button onClick={handleSelect}>
            {selectMode ? "Deselect" : "Select"}
          </button>
          <button onClick={handleMeta}>Meta</button>
        </div>
      </div>
    </div>
  );
};

export default Chapter;