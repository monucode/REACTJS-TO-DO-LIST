import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddProjectForm({ onAdd }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: trimmed, owner_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Insert Error:", error.message);
      alert(error.message);
    } else {
      onAdd(data);
      setName("");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project name"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
