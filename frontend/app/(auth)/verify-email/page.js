"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader, Mail, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import verifyEmailCall from "@/lib/apiCalls/auth/verifyEmail.apiCalls";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token && emailParam) {
      verifyEmail(token, emailParam);
    }
  }, []);

  const verifyEmail = async (token, email) => {
    try {
      const response = await verifyEmailCall(token, email);

      if (response.success) {
        setStatus("success");
        setMessage(response.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "An error occurred during verification.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500">
          {}
          <div className="flex justify-center mb-6">
            {status === "verifying" && (
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
              </div>
            )}

            {status === "success" && (
              <div className="relative animate-bounce-in">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle
                    className="w-10 h-10 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
            )}

            {status === "error" && (
              <div className="relative animate-shake">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          {}
          <h1 className="text-3xl font-bold text-center mb-3 text-gray-800">
            {status === "verifying" && "Verifying Your Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>

          {}
          {email && (
            <div className="flex items-center justify-center gap-2 mb-6 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          )}

          {}
          <p className="text-center text-gray-600 mb-8 leading-relaxed">
            {status === "verifying" &&
              "Please wait while we verify your email address..."}
            {status === "success" && message}
            {status === "error" && message}
          </p>

          {}
          {status === "verifying" && (
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-blue-500 rounded-full animate-progress"></div>
              </div>
            </div>
          )}

          {}
          {status === "success" && (
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Continue to Login
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <span className="text-center text-red-500 font-semibold">
                {message}
              </span>
            </div>
          )}

          {}
          {status === "success" && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  <span className="font-semibold">✓ Account Activated</span>
                  <br />
                  You can now access all features of your account.
                </p>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Need help?{" "}
            <a
              href="/support"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-shake {
          animation: shake 0.6s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
