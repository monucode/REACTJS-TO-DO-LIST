import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddProjectForm({ onAdd }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: trimmed, owner_id: user.id }])
      .select()
      .single();

    if (!error) {
      onAdd(data);
      setName("");
    } else {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project name"
      />
      <button type="submit">Add</button>
    </form>
  );
}
