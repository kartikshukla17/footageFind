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
      
      {/* Video Section */}
      <section className="max-w-4xl mx-auto mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Watch How It Works</h2>
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg max-w-2xl mx-auto">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/kBK_14_joqg?si=ojdkYIuKn32ReftS"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </section>



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