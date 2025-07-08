export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <p className="text-sm text-gray-400 text-center md:text-left mb-2 md:mb-0">
          © {new Date().getFullYear()} DIY HQ. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a href="/about" className="text-gray-400 hover:text-white">About Us</a>
          <a href="/contact" className="text-gray-400 hover:text-white">Contact</a>
          <a href="/terms" className="text-gray-400 hover:text-white">Terms & Conditions</a>
          <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
