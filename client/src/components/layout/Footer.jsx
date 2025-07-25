export default function Footer() {
  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Powered by Gemini API & NewsAPI &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}