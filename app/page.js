import ScriptUpload from "../components/ScriptUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8 justify-center">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Script Analyzer
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Upload your JSON script to extract keywords and discover relevant media.
        </p>
      </div>

      {/* ScriptUpload Component */}
      <div className="max-w-4xl mx-auto">
        <ScriptUpload />
      </div>

      {/* Footer Section */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>
          Built by {" Kartik Shukla"}
        </p>
      </footer>
    </main>
  );
}