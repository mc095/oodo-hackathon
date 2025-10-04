'use client';

export default function SigninTestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Signin Test Page</h1>
        <p className="text-gray-600">This page is working!</p>
        <a href="/signin" className="text-blue-500 underline mt-4 block">
          Go to actual signin page
        </a>
      </div>
    </div>
  );
}
