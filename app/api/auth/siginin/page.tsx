"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getSession } from "next-auth/react";
export default function SignInPage() {
  // State to hold form values
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const Session = useSession();

  // const handleSignIn = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   // Reset error state
  //   setError(null);

  //   // Basic validation (you can add more complex checks if necessary)
  //   if (!email || !password) {
  //     setError("Email and password are required.");
  //     return;
  //   }

  //   const response = await signIn("credentials", {
  //     email,
  //     password,
  //     redirect: false, // Prevent automatic redirect, we will handle it manually
  //   });

  //   if (response?.error) {
  //     setError("Invalid credentials. Please try again.");
  //   } else {
  //     console.log(Session);
  //     if (Session.data?.user.role === "admin") {
  //       router.push("/admin");
  //     } else if (Session.data?.user.role === "worker") {
  //       router.push("/worker");
  //     }
  //     // Redirect to dashboard or other page based on user role or other logic
  //   }
  // };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Reset error state
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent automatic redirect
    });

    if (response?.error) {
      setError("Invalid credentials. Please try again.");
    } else {
      // Wait for session to update
      const updatedSession = await getSession();

      if (updatedSession?.user.role === "admin") {
        router.push("/admin");
      } else if (updatedSession?.user.role === "worker") {
        router.push("/worker");
      } else {
        setError("Unknown role. Please contact support.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <form
        onSubmit={handleSignIn}
        className="bg-white p-8 rounded shadow-lg w-[40%] flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          className={`${
            loading ? "bg-gray-400" : "bg-blue-500"
          } w-full  text-white px-4 py-2 rounded-md hover:bg-blue-600 `}
        >
          {loading ? "Signing In" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
