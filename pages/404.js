export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 text-center px-6 py-16">
      <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Oops! This one's not a DIY job.</h2>
      <p className="text-gray-700 max-w-xl mb-6">
        Looks like this page doesn't exist... and unfortunately, duct tape and WD-40 won't fix it.
        We'll handle it from our end — you just keep crushing those projects.
      </p>
      <a
        href="/"
        className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-5 rounded-lg transition"
      >
        🔧 Back to Safety (Home)
      </a>
    </div>
  );
}
