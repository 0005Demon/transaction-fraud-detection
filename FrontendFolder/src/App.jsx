import React, { useState } from 'react';
import { Loader2, UploadCloud, FileText } from 'lucide-react';

export default function TransactionFraudDetector() {
  const [file, setFile] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [pastedData, setPastedData] = useState('');
  const [mode, setMode] = useState("file"); // "file", "paste", "folder"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
    setResult(null);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let response;
      if (mode === 'file') {
        if (!file) return alert('Upload a file');
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('http://localhost:5000/api/extract', {
          method: 'POST',
          body: formData
        });
      } else if (mode === 'paste') {
        response = await fetch('http://localhost:5000/api/predict-manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: pastedData
        });
      } else if (mode === 'folder') {
        if (!folderFiles.length) return alert('Select folder files');
        const formData = new FormData();
        folderFiles.forEach(file => formData.append('files', file));
        response = await fetch('http://localhost:5000/api/batch-predict', {
          method: 'POST',
          body: formData
        });
      }

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <>
      <header className="w-full px-6 py-4 bg-white/100 shadow-md fixed top-0 left-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">🧾 TC's Guard AI</h1>
          <nav className="space-x-4 text-gray-700 font-medium">
            <a href="#" className="hover:text-blue-600">Home</a>
            <a href="#" className="hover:text-blue-600">Features</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </nav>
        </div>
      </header>

      <div className="min-h-screen pt-32 flex bg-[url('/images/sujeeth-potla-IcVPt8Ryqks-unsplash.jpg')] bg-cover bg-center bg-no-repeat items-start justify-center bg-gray-50">
        <div className="max-w-xl w-full mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">🧾 AI Transaction Fraud Detector</h1>

          <div className="flex justify-center space-x-4 mb-4">
            {['file', 'paste', 'folder'].map((m) => (
              <button
                key={m}
                className={`px-4 py-2 rounded-full font-medium ${
                  mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setMode(m);
                  setFile(null);
                  setResult(null);
                  setFolderFiles([]);
                  setPastedData('');
                }}
              >
                {m === 'file' && 'Upload File'}
                {m === 'paste' && 'Paste JSON'}
                {m === 'folder' && 'Upload Folder'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'file' && (
              <div
                className="border-2 border-dashed border-gray-400 p-6 rounded-xl mb-4 text-center cursor-pointer hover:border-blue-500"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <UploadCloud className="mx-auto mb-2 text-blue-600" size={36} />
                <p className="text-gray-700">Drag & drop your file here, OR</p>
                <label className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
                  📁 Choose File
                  <input
                    type="file"
                    accept=".csv,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

               {file && (
         <div className="flex items-center justify-between gap-2 text-sm text-gray-700 mb-4 bg-gray-100 p-2 rounded-md">
    <div className="flex items-center gap-2">
      <FileText className="text-blue-600" size={18} />
      <span className="truncate max-w-[200px]">{file.name}</span>
    </div>
    <button
      type="button"
      onClick={() => setFile(null)}
      className="text-red-600 hover:text-red-800 font-semibold"
    >
      ✖ Clear
    </button>
  </div>
)}

            {mode === 'paste' && (
              <textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Paste transaction JSON here..."
                rows={6}
                className="w-full border rounded-lg p-2 text-sm mb-4"
              />
            )}

            {mode === 'folder' && (
              <div className="mb-4">
                <input
                  type="file"
                  webkitdirectory="true"
                  directory=""
                  multiple
                  onChange={(e) => setFolderFiles(Array.from(e.target.files))}
                />
                {folderFiles.length > 0 && (
                  <p className="text-sm mt-2">{folderFiles.length} files selected</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </form>

          {/* Results Display */}
          {result && !Array.isArray(result) && (
            <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">📊 Prediction Result</h2>
              <p><strong>Fraud Prediction:</strong> <span className={`font-bold ${result.prediction === 1 ? 'text-red-600' : 'text-green-600'}`}>{result.prediction === 1 ? 'FRAUD' : 'LEGITIMATE'}</span></p>
              <p><strong>Confidence:</strong> {Math.round((result.confidence ?? 0) * 100)}%</p>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">📄 Transaction Details:</h3>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {Object.entries(result.raw_fields || {}).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {String(value)}</li>
                  ))}
                </ul>
              </div>

{/*               <div className="mt-4"> */}
{/*                 <h3 className="font-semibold text-gray-700 mb-2">⚙️ Processed Features:</h3> */}
{/*                 <ul className="text-sm text-gray-700 list-disc list-inside"> */}
{/*                   {Object.entries(result.processed_features || {}).map(([key, value]) => ( */}
{/*                     <li key={key}><strong>{key}:</strong> {String(value)}</li> */}
{/*                   ))} */}
{/*                 </ul> */}
{/*               </div> */}
            </div>
          )}

          {Array.isArray(result) && result.map((r, idx) => (
            <div key={idx} className="mt-6 bg-gray-50 p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">📁 File #{idx + 1}</h2>
              <p><strong>Prediction:</strong> <span className={r.prediction === 1 ? 'text-red-600' : 'text-green-600'}>{r.prediction === 1 ? 'FRAUD' : 'LEGITIMATE'}</span></p>
              <p><strong>Confidence:</strong> {Math.round(r.confidence * 100)}%</p>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
