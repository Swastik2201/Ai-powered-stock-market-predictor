import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl bg-surface border border-border">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-slate-400">Get started with AI financial intelligence</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-slate-100 focus:outline-none focus:border-aiAccent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-slate-100 focus:outline-none focus:border-aiAccent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-slate-100 focus:outline-none focus:border-aiAccent"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-aiAccent font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-aiAccent hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
