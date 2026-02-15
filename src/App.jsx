// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Placeholder untuk halaman (kita akan buat filenya setelah ini)
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">My Races</h1>
    <p className="text-gray-600">
      Daftar race yang kamu ikuti akan muncul di sini.
    </p>
  </div>
);

const RaceDetail = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Detail Pengeluaran</h1>
    <p className="text-gray-600">Rincian biaya race akan muncul di sini.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/race/:id" element={<RaceDetail />} />
        </Routes>

        {/* Toast untuk notifikasi sukses/error */}
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
