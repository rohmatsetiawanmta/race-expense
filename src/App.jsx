import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "./lib/supabase";

// Import Komponen
import RaceForm from "./components/RaceForm";
import RaceDetail from "./pages/RaceDetail";
import CategoryIcon from "./components/ui/CategoryIcon";

// --- KOMPONEN STATS DASHBOARD ---
const StatsDashboard = ({ races }) => {
  const totalRaces = races.length;
  // Menghitung akumulasi semua pengeluaran dari semua race yang ada di list
  const totalInvestment = races.reduce(
    (sum, race) => sum + (race.total_spend || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-black uppercase tracking-[0.2em] mb-2">
            Total Conquests
          </p>
          <h2 className="text-5xl font-black italic leading-none">
            {totalRaces}{" "}
            <span className="text-xl not-italic font-medium opacity-80">
              Races
            </span>
          </h2>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 uppercase font-black text-8xl italic select-none">
          RUN
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
          Grand Total Investment
        </p>
        <h2 className="text-5xl font-black text-slate-900 italic leading-none text-balance">
          <span className="text-xl not-italic font-bold mr-2 text-blue-600">
            IDR
          </span>
          {totalInvestment.toLocaleString("id-ID")}
        </h2>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA: DASHBOARD ---
const Dashboard = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      // Query untuk mengambil race sekaligus data pengeluarannya (amount saja)
      const { data, error } = await supabase
        .from("races")
        .select(
          `
          *,
          expenses(amount)
        `
        )
        .order("date", { ascending: false });

      if (error) throw error;

      // Map data untuk menghitung total_spend per race secara client-side
      const racesWithTotal = data.map((race) => ({
        ...race,
        total_spend:
          race.expenses?.reduce(
            (sum, exp) => sum + parseFloat(exp.amount),
            0
          ) || 0,
      }));

      setRaces(racesWithTotal);
    } catch (error) {
      console.error("Error fetching races:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
          Race <span className="text-blue-600">Vault</span>
        </h1>
        <div className="h-2 w-24 bg-blue-600 mt-4 rounded-full"></div>
      </header>

      <StatsDashboard races={races} />

      <section className="mb-16">
        <RaceForm onRaceAdded={fetchRaces} />
      </section>

      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-slate-800 shrink-0">
            Timeline
          </h2>
          <div className="h-[2px] w-full bg-slate-100"></div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-32 bg-slate-100 animate-pulse rounded-[2rem]"
              ></div>
            ))}
          </div>
        ) : races.length === 0 ? (
          <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
            <CategoryIcon
              iconName="Trophy"
              className="w-16 h-16 mx-auto text-slate-200 mb-6"
            />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em]">
              Empty Archives
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {races.map((race) => (
              <Link
                key={race.id}
                to={`/race/${race.id}`}
                className="group relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 flex flex-col md:flex-row shadow-sm hover:shadow-2xl hover:border-blue-400 transition-all duration-500"
              >
                {/* Visual Accent Bar */}
                <div
                  className={`w-full md:w-4 h-4 md:h-auto shrink-0 ${
                    race.distance?.includes("42")
                      ? "bg-orange-500"
                      : "bg-blue-600"
                  }`}
                ></div>

                <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-slate-900 text-white rounded-full">
                        {race.distance || "N/A"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        REF: {race.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="font-black text-4xl text-slate-800 group-hover:text-blue-600 transition-colors uppercase italic leading-none tracking-tighter">
                      {race.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
                        <CategoryIcon
                          iconName="MapPin"
                          className="w-4 h-4 text-blue-500"
                        />
                        {race.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
                        <CategoryIcon
                          iconName="Calendar"
                          className="w-4 h-4 text-blue-500"
                        />
                        {new Date(race.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">
                      Total Spend
                    </p>
                    <div className="text-4xl font-black text-slate-900 group-hover:text-blue-600 transition-colors italic">
                      <span className="text-sm not-italic mr-1 opacity-50 font-bold">
                        RP
                      </span>
                      {race.total_spend.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Ticket Punch Decoration */}
                <div className="hidden md:block absolute left-[-15px] top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-200"></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP ENTRY POINT ---
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/race/:id" element={<RaceDetail />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#fff",
              borderRadius: "20px",
              fontFamily: "system-ui",
              fontWeight: "900",
              textTransform: "uppercase",
              fontSize: "11px",
              letterSpacing: "0.1em",
            },
          }}
        />
      </div>
    </Router>
  );
}
