import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[hsl(210,11%,15%)] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-[hsl(120,100%,50%)]">404</h1>
        <h2 className="text-2xl mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <a className="bg-[hsl(120,100%,50%)] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[hsl(120,100%,45%)] transition-colors">
            Go Home
          </a>
        </Link>
      </div>
    </div>
  );
}
