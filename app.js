// app.js
//const API_URL = "http://localhost:5000/api/operacion"; // Cambiar a la IP pública cuando subas a AWS
const API_URL = "http://3.234.41.31:5000/api/operacion";
//const API_URL = "http://3.234.41.31/api/operacion";

function safeEval(expr) {
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) 
    throw new Error("La expresión contiene caracteres no permitidos");

  return Function(`"use strict"; return (${expr});`)();
}

function extractExpressionFrom(text) {
  const regex = /[0-9\.\s\+\-\*\/\(\)]+/g;
  const matches = text.match(regex);
  if (!matches) return "";

  let best = "";
  for (const m of matches) {
    if (/[+\-*/]/.test(m) && m.trim().length > best.length) best = m.trim();
  }
  return best;
}

document.getElementById("opForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = document.getElementById("inputTexto").value.trim();
  const explicit = document.getElementById("expression").value.trim();
  let expr = explicit || extractExpressionFrom(text);

  const resultJSON = document.getElementById("resultJSON");
  const resultArea = document.getElementById("resultArea");

  resultArea.style.display = "none";
  resultJSON.textContent = "";

  if (!expr) {
    showAlert("No se encontró ninguna expresión válida.");
    return;
  }

  let result;
  try {
    result = safeEval(expr);
  } catch (err) {
    showAlert("Error al evaluar la expresión: " + err.message);
    return;
  }

  const payload = {
    operacion_aritmetica: expr,
    resultado: String(result),
    text
  };

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Error en servidor");

    resultJSON.textContent = JSON.stringify(data, null, 2);
    resultArea.style.display = "block";

  } catch (err) {
    showAlert("Fallo al enviar: " + err.message);
  }
});

// ALERTA BONITA Bootstrap
function showAlert(msg) {
  const alertBox = document.getElementById("alertBox");
  alertBox.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>⚠ Error:</strong> ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}


