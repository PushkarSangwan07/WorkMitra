import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative">
        <p className="text-[8rem] font-black text-gray-100 dark:text-gray-800 leading-none select-none">404</p>
        <p className="absolute inset-0 flex items-center justify-center text-[8rem] font-black gradient-text opacity-20 leading-none select-none">404</p>
      </div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-4">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/search" className="btn-secondary">Find workers</Link>
      </div>
    </div>
  );
}
