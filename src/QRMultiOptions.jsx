import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import QrScanner from "qr-scanner"; //  added for image scanning
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const QRMultiOptions = () => {
  const [mode, setMode] = useState("text"); // "text" or "table"
  const [text, setText] = useState("");
  const [table, setTable] = useState({
    columns: ["Column 1", "Column 2"],
    rows: [["", ""]],
  });
  const [qrData, setQrData] = useState("");
  const [scannedData, setScannedData] = useState("");
  const [scanning, setScanning] = useState(false);

  // Generate QR based on mode
  const generateQR = () => {
    if (mode === "text") {
      setQrData(text);
    } else {
      setQrData(JSON.stringify({ columns: table.columns, rows: table.rows }));
    }
  };

  // Add row
  const addRow = () => {
    setTable((prev) => ({
      ...prev,
      rows: [...prev.rows, Array(prev.columns.length).fill("")],
    }));
  };

  // Add column
  const addColumn = () => {
    setTable((prev) => ({
      columns: [...prev.columns, `Column ${prev.columns.length + 1}`],
      rows: prev.rows.map((row) => [...row, ""]),
    }));
  };

  // Update column name
  const updateColumnName = (index, value) => {
    const newCols = [...table.columns];
    newCols[index] = value;
    setTable((prev) => ({ ...prev, columns: newCols }));
  };

  // Update cell value
  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...table.rows];
    newRows[rowIndex][colIndex] = value;
    setTable((prev) => ({ ...prev, rows: newRows }));
  };

  // Download QR code
  const downloadQR = () => {
    const canvas = document.getElementById("qrCodeEl");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // ✅ Handle Image Upload and Scan
  const handleScanUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await QrScanner.scanImage(file);
      setScannedData(result);
    } catch (error) {
      console.error("QR scan failed:", error);
      setScannedData("No QR code found in image.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>QR Code Generator with Multiple Options</h2>

      {/* Mode Selection */}
      <div>
        <label>
          <input
            type="radio"
            value="text"
            checked={mode === "text"}
            onChange={() => setMode("text")}
          />
          Text
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            value="table"
            checked={mode === "table"}
            onChange={() => setMode("table")}
          />
          Table
        </label>
      </div>

      {/* Text Input */}
      {mode === "text" && (
        <div style={{ marginTop: "20px" }}>
          <textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "300px", height: "100px" }}
          />
        </div>
      )}

      {/* Table Input */}
      {mode === "table" && (
        <div style={{ marginTop: "20px" }}>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                {table.columns.map((col, colIndex) => (
                  <th key={colIndex}>
                    <input
                      type="text"
                      value={col}
                      onChange={(e) =>
                        updateColumnName(colIndex, e.target.value)
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          updateCell(rowIndex, colIndex, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow} style={{ margin: "5px" }}>
            Add Row
          </button>
          <button onClick={addColumn}>Add Column</button>
        </div>
      )}

      {/* Generate QR Button */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={generateQR}>Generate QR Code</button>
      </div>

      {/* QR Code Display */}
      {qrData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated QR Code:</h3>
          <QRCodeCanvas value={qrData} size={256} id="qrCodeEl" />
          <br />
          <button onClick={downloadQR} style={{ marginTop: "10px" }}>
            Download QR Code
          </button>
        </div>
      )}

      {/* QR Code Scanner */}
      <div style={{ marginTop: "40px" }}>
        <h3>Scan a QR Code:</h3>
        {!scanning && (
          <button onClick={() => setScanning(true)}>Start Scanner</button>
        )}
        {scanning && (
          <div>
            <BarcodeScannerComponent
              width={300}
              height={300}
              onUpdate={(err, result) => {
                if (result) {
                  setScannedData(result.text);
                  setScanning(false);
                }
              }}
            />
            <button onClick={() => setScanning(false)}>Stop Scanner</button>
          </div>
        )}
      </div>

      {/* Upload Image Scanner */}
      <div style={{ marginTop: "20px" }}>
        <h4>Upload QR Image:</h4>
        <input type="file" accept="image/*" onChange={handleScanUpload} />
      </div>

      {/* Show Scanned Data */}
      {scannedData && (
        <div style={{ marginTop: "20px" }}>
          <h4>Scanned Result:</h4>
          <pre>{scannedData}</pre>

          {/* If scanned JSON (table), show in table format */}
          {(() => {
            try {
              const parsed = JSON.parse(scannedData);
              if (parsed?.columns && parsed?.rows) {
                return (
                  <table border="1" style={{ margin: "10px auto" }}>
                    <thead>
                      <tr>
                        {parsed.columns.map((col, i) => (
                          <th key={i}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} style={{ padding: "5px 10px" }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }
            } catch {}
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default QRMultiOptions;
//https://qr-code-er5jpetr5-aeshashah25s-projects.vercel.app/