import { useState } from "react";
import { supabase } from "./supabase";

function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          role,
        },
      ]);
    }

    setLoading(false);
    if (onAuthSuccess) onAuthSuccess();
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? "Skaff Login" : "Skaff Register"}
        </h2>

        {error && (
          <div className="bg-red-600 text-white p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-zinc-800 border border-zinc-700"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-zinc-800 border border-zinc-700"
        />

        {!isLogin && (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700"
          >
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
            <option value="hr">HR</option>
          </select>
        )}

        {isLogin ? (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded mb-3"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        ) : (
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded mb-3"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        )}

        <div className="text-center mt-4 text-sm text-gray-400">
          {isLogin ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-cyan-400 hover:underline"
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-cyan-400 hover:underline"
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;