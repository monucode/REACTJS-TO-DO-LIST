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
      setMessage("Name and Email are required.");
      return;
    }

    setBusy(true);
    setMessage("");

    // ✅ 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBusy(false);
      setMessage("⚠️ Not authenticated.");
      return;
    }

    // ✅ 2. Check if the email belongs to a signed-up user (from profiles table)
    const { data: userMatch, error: userLookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (userLookupError || !userMatch) {
      setBusy(false);
      setMessage("⚠️ No user found with that email. Ask them to sign up first.");
      return;
    }

    // ✅ 3. Check if member already exists
    const { data: existing, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("email", email.trim());

    if (fetchError) {
      setBusy(false);
      setMessage("⚠️ Error checking existing members.");
      return;
    }

    if (existing.length > 0) {
      setBusy(false);
      setMessage("⚠️ Member already exists in this project.");
      return;
    }

    // ✅ 4. Add new member
    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          project_id: projectId,
          name: name.trim(),
          email: email.trim(),
          user_id: user.id, // the user who added them
        },
      ])
      .select()
      .single();

    setBusy(false);

    if (error) {
      setMessage(`❌ ${error.message}`);
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

      {message && (
        <p style={{ marginTop: "0.5rem", color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </form>
  );
}
