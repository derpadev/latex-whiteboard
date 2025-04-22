import React, { useRef, useEffect, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import html2canvas from "html2canvas";

function App() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);
  const [latexInput, setLatexInput] = useState("");
  const [latexImage, setLatexImage] = useState(null);
  const [latexPosition, setLatexPosition] = useState({ x: 0, y: 0 });
  const [placingLatex, setPlacingLatex] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

// Initialize Canvas, set whiteboard size
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 3*window.innerWidth/4;
    canvas.height = window.innerHeight;
  }, []);

  const startDrawing = (e) => {
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const context = canvasRef.current.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (e) => setColor(e.target.value);

  const activateEraser = () => {
    setColor("white");
    setLineWidth(10);
  };

  const activatePen = () => {
    setColor("black");
    setLineWidth(2);
  };

  const handleLatexChange = (e) => {
    setLatexInput(e.target.value);
    try {
      katex.render(e.target.value, previewRef.current, {
        throwOnError: false,
      });
    } catch (err) {
      previewRef.current.innerHTML = `<span style="color:red;">Invalid LaTeX</span>`;
    }
  };

  const handleLatexPlace = async (e) => {
    if (!placingLatex) return

    const previewEl = previewRef.current;
    if (!previewEl) return;
  
    // Use html2canvas to convert the LaTeX preview into an image
    const tempCanvas = await html2canvas(previewEl, {
      backgroundColor: null,
      scale: 2,
    });
  
    const realCanvas = canvasRef.current;
    const ctx = realCanvas.getContext("2d");
  
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
  
    // Draw the captured image onto the actual canvas
    ctx.drawImage(tempCanvas, x, y);

    setPlacingLatex(false);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, newMessage]);
    setNewMessage("");
  };
  

  return (
    <>
      {/* Toolbar */}
      <div style={{ 
        position: "fixed",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1,
        backgroundColor: "#fff", 
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0 0 5px rgba(0,0,0,0.2)" 
        }}
      >
        <input type="color" onChange={handleColorChange} value={color} />
        <button onClick={activatePen}>✏️ Pen</button>
        <button onClick={activateEraser}>🧽 Eraser</button>
        <button
          onClick={() => setPlacingLatex(true)}
          style={{ backgroundColor: placingLatex ? "#ddd" : "#fff" }}
        >
          📐 Place Equation
        </button>

        <br /><br />
        
        {/* LaTeX Input */}
        <input
          type="text"
          placeholder="Type LaTeX (e.g. \\frac{1}{x})"
          value={latexInput}
          onChange={handleLatexChange}
          style={{ padding: "4px", width: "300px" }}
        />
        <div
          ref={previewRef}
          style={{
            backgroundColor: "#fff",
            padding: "4px 8px",
            border: "1px solid #ccc",
            marginTop: "4px",
            display: "inline-block",
          }}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={handleLatexPlace}
        style={{ border: "1px solid #ccc", display: "block" }}
      />
      
      {/* Render LaTeX Image on Canvas */}
      {latexImage && (
        <img
          src={latexImage}
          alt="LaTeX"
          style={{
            position: "absolute",
            left: `${latexPosition.x}px`,
            top: `${latexPosition.y}px`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Chat Panel */}
<div style={{
  position: "fixed",
  top: 10,
  right: 10,
  width: "300px",
  height: "80vh",
  backgroundColor: "#f9f9f9",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxShadow: "0 0 5px rgba(0,0,0,0.2)",
  padding: "10px",
  display: "flex",
  flexDirection: "column",
  zIndex: 1,
}}>
  <div style={{
    flex: 1,
    overflowY: "auto",
    marginBottom: "8px",
    paddingRight: "4px"
  }}>
    {messages.map((msg, idx) => (
      <div key={idx} style={{
        backgroundColor: "#fff",
        padding: "6px 10px",
        marginBottom: "6px",
        borderRadius: "6px",
        boxShadow: "0 0 2px rgba(0,0,0,0.1)"
      }}>
        {msg}
      </div>
    ))}
  </div>
  <div style={{ display: "flex" }}>
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage();
      }}
      placeholder="Type a message..."
      style={{
        flex: 1,
        padding: "6px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        marginRight: "4px"
      }}
    />
    <button onClick={sendMessage} style={{ padding: "6px 12px" }}>Send</button>
  </div>
</div>

    </>

  );
}

export default App;
