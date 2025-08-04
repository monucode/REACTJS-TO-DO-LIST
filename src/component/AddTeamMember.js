import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddTeamMember({ projectId, onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage("Name and Email required");
      return;
    }

    setBusy(true);
    setMessage("");

    // ✅ Check if already added
    const { data: existing, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("email", email.trim());

    if (fetchError) {
      setBusy(false);
      setMessage("Error checking existing members");
      return;
    }

    if (existing.length > 0) {
      setBusy(false);
      setMessage("Member already exists in this project.");
      return;
    }

    // ✅ Add new member
    const { data, error } = await supabase
      .from("team_members")
      .insert([{ project_id: projectId, name: name.trim(), email: email.trim() }])
      .select()
      .single();

    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setEmail("");
    setMessage("✅ Member added successfully!");

    if (onAdd) onAdd(data);
  }

  return (
    <form className="team-form" onSubmit={submit} style={{ marginBottom: "1rem" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <button disabled={busy}>
        {busy ? "Adding…" : "Add Member"}
      </button>

      {/* ✅ Small Toast Message */}
      {message && (
        <p style={{ marginTop: "0.5rem", color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </form>
  );
}
