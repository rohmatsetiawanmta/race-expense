import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCategories } from "../hooks/useCategories";
import CategoryIcon from "../components/ui/CategoryIcon";
import { toast } from "react-hot-toast";

const RaceDetail = () => {
  const { id } = useParams();
  const [race, setRace] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const { categories } = useCategories();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [file, setFile] = useState(null);
  const [issubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: raceData } = await supabase
        .from("races")
        .select("*")
        .eq("id", id)
        .single();
      setRace(raceData);

      const { data: expData } = await supabase
        .from("expenses")
        .select("*, categories(name, icon_name)")
        .eq("race_id", id)
        .order("expense_date", { ascending: false });

      setExpenses(expData || []);
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Pilih kategori!");

    setIsSubmitting(true);
    try {
      let imageUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("expense-proofs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("expense-proofs").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("expenses").insert([
        {
          race_id: id,
          category_id: categoryId,
          amount: parseFloat(amount),
          description,
          expense_date: expenseDate,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      toast.success("EXPENSE ARCHIVED!");
      setAmount("");
      setDescription("");
      setCategoryId("");
      setFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !race)
    return (
      <div className="p-12 text-center font-black animate-pulse tracking-[0.3em]">
        LOADING VAULT...
      </div>
    );

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-8 transition-colors"
      >
        <CategoryIcon iconName="ArrowLeft" className="w-4 h-4" /> Back to Vault
      </Link>

      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
              {race?.distance} EVENT
            </span>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-2 leading-none">
              {race?.name}
            </h1>
            <p className="text-slate-400 font-bold mt-3 uppercase tracking-tight">
              {race?.location} • {race?.date}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
              Total Investment
            </p>
            <div className="text-5xl font-black italic text-blue-400 leading-none">
              <span className="text-xl not-italic mr-2 font-bold opacity-50">
                RP
              </span>
              {totalAmount.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
        {/* Update Aksen Background sesuai request */}
        <div className="absolute right-[-20px] top-[-20px] opacity-10 text-8xl font-black italic select-none max-w-full truncate px-4">
          {race?.name.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <form
            onSubmit={handleAddExpense}
            className="bg-white p-8 rounded-[2rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] sticky top-8"
          >
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-6">
              Log Expense
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Category
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm"
                >
                  <option value="">SELECT CATEGORY</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Transaction Date
                </label>
                <input
                  required
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Amount (IDR)
                </label>
                <input
                  required
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.G. HOTEL DP"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Proof (Image/PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf" // Update: mengizinkan PDF
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-600 cursor-pointer"
                />
              </div>

              <button
                disabled={issubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest italic hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
              >
                {issubmitting ? "Processing..." : "Save Record"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-800">
            Expense History
          </h2>
          {expenses.map((exp) => {
            const isPDF = exp.image_url?.toLowerCase().endsWith(".pdf");

            return (
              <div
                key={exp.id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-5">
                  {exp.image_url ? (
                    <a
                      href={exp.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative group/img shrink-0"
                    >
                      {isPDF ? (
                        /* Tampilan jika file adalah PDF */
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex flex-col items-center justify-center border-2 border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <CategoryIcon
                            iconName="FileText"
                            className="w-6 h-6 text-red-600 group-hover:text-white"
                          />
                          <span className="text-[8px] font-black mt-1">
                            PDF
                          </span>
                        </div>
                      ) : (
                        /* Tampilan jika file adalah Gambar */
                        <img
                          src={exp.image_url}
                          alt="proof"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-2xl transition-opacity flex items-center justify-center text-white text-[8px] font-black uppercase tracking-widest">
                        {isPDF ? "OPEN PDF" : "VIEW IMG"}
                      </div>
                    </a>
                  ) : (
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 shrink-0">
                      <CategoryIcon
                        iconName={exp.categories?.icon_name}
                        className="w-6 h-6"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black uppercase italic text-slate-800 tracking-tight leading-none">
                        {exp.categories?.name}
                      </h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                        {new Date(exp.expense_date).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "short" }
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 leading-tight">
                      {exp.description || "No notes"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black italic text-slate-900 leading-none">
                    <span className="text-xs not-italic mr-1 opacity-20 font-bold">
                      RP
                    </span>
                    {parseFloat(exp.amount).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RaceDetail;
