import { useState } from "react";

export default function HeroSection({ onSearch }: { onSearch: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="hero-gradient h-96 flex items-center justify-center text-white">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover the best food & drinks</h1>
        <form onSubmit={handleSearch}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex items-center max-w-xl mx-auto">
            <div className="flex items-center px-3 border-r border-gray-300 text-gray-700">
              <i className="fas fa-map-marker-alt text-[#CB202D] mr-2"></i>
              <span className="text-sm">Bangalore</span>
              <i className="fas fa-chevron-down text-xs ml-2 text-gray-500"></i>
            </div>
            <div className="flex items-center px-3 py-3 flex-1 text-gray-700">
              <i className="fas fa-search text-gray-400 mr-2"></i>
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="w-full outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-gradient {
          background: linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80');
          background-size: cover;
          background-position: center;
        }
        `
      }} />
    </section>
  );
}
