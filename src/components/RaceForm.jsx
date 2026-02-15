import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

const RaceForm = ({ onRaceAdded }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [loading, setLoading] = useState(false);

  // Menggunakan UUID yang Anda berikan
  const TEMP_USER_ID = "3200ac84-2611-4c20-8c3e-e33c4fba5075";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("races")
        .insert([
          {
            name,
            date,
            location,
            distance,
            user_id: TEMP_USER_ID,
          },
        ])
        .select();

      if (error) throw error;

      toast.success("RACE ARCHIVED SUCCESSFULLY!");
      setName("");
      setDate("");
      setLocation("");
      setDistance("");
      if (onRaceAdded) onRaceAdded(data[0]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-[2rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] mb-12"
    >
      <h3 className="text-xl font-black italic uppercase tracking-tight mb-6 flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
        Register New Race
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-shadow-sm">
            Event Name
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="BOROBUDUR MARATHON"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold uppercase transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-shadow-sm">
            Race Date
          </label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-shadow-sm">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="MAGELANG, INDONESIA"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold uppercase transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-shadow-sm">
            Category
          </label>
          <input
            type="text"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="42K / 21K / 10K"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold uppercase transition-all"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 disabled:bg-slate-300"
      >
        {loading ? "Processing..." : "Add to Vault"}
      </button>
    </form>
  );
};

export default RaceForm;
