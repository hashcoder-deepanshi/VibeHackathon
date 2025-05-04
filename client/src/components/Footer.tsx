import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <img 
              src="https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954218.png" 
              alt="Zomato Logo" 
              className="h-7 mb-4 brightness-0 invert"
            />
            <div className="flex space-x-4">
              <a href="#" className="text-white">
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-instagram text-lg"></i>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">About Zomato</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Who We Are</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Blog</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Work With Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Investor Relations</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Report Fraud</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">For Restaurants</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Partner With Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Apps For You</Link></li>
                <li><Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Admin Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Learn More</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Privacy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Security</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Terms</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white text-sm">Sitemap</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-sm text-gray-400">
          <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners.</p>
          <p className="mt-2">© 2023 Zomato Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
