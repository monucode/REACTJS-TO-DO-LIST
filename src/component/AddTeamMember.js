import { useState } from "react";
import { supabase } from "../supabaseClient";

/* owner-only add form */
export default function AddTeamMember({ projectId, onAdd }) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy]   = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setBusy(true);

    /* optional: send Supabase Auth invite
       await supabase.auth.admin.inviteUserByEmail(email, { redirectTo: `${window.location.origin}/login` });
    */

    const { data, error } = await supabase
      .from("team_members")
      .insert([{ project_id: projectId, name: name.trim(), email: email.trim() }])
      .select().single();
    setBusy(false);

    if (error) return alert(error.message);
    setName(""); setEmail("");
    onAdd(data);
  }

  return (
    <form className="team-form" onSubmit={submit}>
      <input value={name}  onChange={e=>setName(e.target.value)}  placeholder="Name"  />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"/>
      <button disabled={busy}>{busy ? "…" : "Add"}</button>
    </form>
  );
}
