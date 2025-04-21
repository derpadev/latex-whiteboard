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


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
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

  return (
    <>
      {/* Toolbar */}
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 1 }}>
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
    </>
  );
}

export default App;
