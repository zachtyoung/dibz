import Link from "next/link";
import { signIn } from "@/app/auth/actions";

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: CREAM }}>
      <Link href="/" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "3rem", color: INK, textDecoration: "none", lineHeight: 1, marginBottom: "2rem", display: "block" }}>
        Dibz<span style={{ color: RED }}>.</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, border: `2px solid ${INK}`, background: "white", boxShadow: `6px 6px 0 ${INK}`, padding: "2rem" }}>
        <h1 style={{ fontFamily: SANS, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, marginBottom: "1.5rem" }}>
          Sign In
        </h1>

        {error && (
          <p style={{ fontFamily: MONO, fontSize: 12, color: RED, marginBottom: "1rem", padding: "10px 12px", border: `1px solid ${RED}` }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ fontFamily: MONO, fontSize: 12, color: INK, marginBottom: "1rem", padding: "10px 12px", border: `1px solid ${INK}` }}>
            {message}
          </p>
        )}

        <form action={signIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: INK }}>Email</span>
            <input
              name="email"
              type="email"
              required
              style={{ border: `2px solid ${INK}`, padding: "10px 12px", fontFamily: MONO, fontSize: 13, color: INK, outline: "none", background: "white" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: INK }}>Password</span>
            <input
              name="password"
              type="password"
              required
              style={{ border: `2px solid ${INK}`, padding: "10px 12px", fontFamily: MONO, fontSize: 13, color: INK, outline: "none", background: "white" }}
            />
          </label>

          <button
            type="submit"
            style={{ background: INK, color: CREAM, padding: "12px", fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: `3px 3px 0 ${RED}`, marginTop: "0.5rem" }}
          >
            Sign In
          </button>
        </form>

        <p style={{ fontFamily: MONO, fontSize: 11, color: INK, opacity: 0.7, marginTop: "1.5rem", textAlign: "center" }}>
          No account?{" "}
          <Link href="/auth/signup" style={{ color: INK, fontWeight: 700, textDecoration: "underline" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
