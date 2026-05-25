import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    console.log({
      email,
      password,
    });

    alert("Login Successful 🚀");
  };

  return (

    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-30" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-200 rounded-full blur-3xl opacity-30" />

      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md">

        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-10">

          {/* LOGO */}
          <div className="flex justify-center mb-6">

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              G
            </div>

          </div>

          {/* TITLE */}
          <div className="text-center mb-10">

            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Welcome Back
            </h1>

            <p className="text-gray-500 leading-7">
              Login to continue your interview preparation journey.
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            {/* EMAIL */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"

                  value={email}

                  onChange={(e) =>
                    setEmail(e.target.value)
                  }

                  placeholder="Enter your email"

                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  value={password}

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  placeholder="Enter your password"

                  className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />

                <button
                  type="button"

                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }

                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>

              </div>

            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">

                <input
                  type="checkbox"
                  className="rounded"
                />

                Remember me

              </label>

              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Forgot Password?
              </button>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"

              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              Login
            </button>

          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-8">

            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200" />

          </div>

          {/* GOOGLE */}
          <button
            className="w-full py-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 font-semibold text-gray-700"
          >

            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />

            Continue with Google

          </button>

          {/* SIGNUP */}
          <p className="text-center text-gray-500 text-sm mt-8">

            Don’t have an account?{" "}

            <button className="text-blue-600 font-semibold hover:text-blue-700">
              Sign Up
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}