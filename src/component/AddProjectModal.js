import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AddProjectModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: name.trim(), owner_id: user.id }])
      .select().single();
    setSaving(false);
    if (!error) { onAdd(data); onClose(); }
    else alert(error.message);
  };

  return (
    <div className="pl-modal-back">
      <form className="pl-modal" onSubmit={submit}>
        <h3>New Project</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        <div className="pl-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
