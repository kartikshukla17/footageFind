export const metadata = {
  title: "Find Footage from Script",
  description: "Upload a script and find related stock footage.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <header className="w-full p-4 bg-blue-500 text-white text-center text-lg">
          Find Footage
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="w-full p-4 text-center text-gray-600">
          &copy; 2025 Find Footage
        </footer>
      </body>
    </html>
  );
}
