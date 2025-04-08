
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="animate-fade-in">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center p-2 bg-primary text-white rounded-xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              GradeUp
              <span className="text-primary">.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              A comprehensive school management system that helps administrators, teachers, and students manage attendance, tasks, and more.
            </p>
            <div className="hidden md:block">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full">Attendance Tracking</div>
                <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">Task Management</div>
                <div className="bg-accent/10 text-accent-foreground px-3 py-1 rounded-full">Student Records</div>
                <div className="bg-muted px-3 py-1 rounded-full">Exam Results</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
