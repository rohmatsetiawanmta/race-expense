// src/lib/storage.js
import { supabase } from "./supabase";

export const uploadProof = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from("expense-proofs")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Ambil Public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("expense-proofs").getPublicUrl(filePath);

  return publicUrl;
};
