import Image from "next/image";

export function ExecutiveFooter() {
  return (
    <footer className="w-full py-4 bg-black border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-3 items-center justify-items-center">
          <div className="w-[60px] sm:w-[120px]">
            <a 
              href="https://www.intellsys.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/Intellsys3.png"
                alt="Powered by Intellsys"
                width={120}
                height={40}
                className="w-full h-auto"
                unoptimized
              />
            </a>
          </div>
          <div className="w-[60px] sm:w-[120px]">
            <a 
              href="https://www.growthjockey.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/Ottocloud3.png"
                alt="Built with Ottocloud"
                width={120}
                height={40}
                className="w-full h-auto"
                unoptimized
              />
            </a>
          </div>
          <div className="w-[60px] sm:w-[120px]">
            <a 
              href="https://www.growthjockey.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/GrowthJockey3.png"
                alt="Ventured by GrowthJockey"
                width={120}
                height={40}
                className="w-full h-auto"
                unoptimized
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

