import * as React from "react";

export function MobileFooter() {
  return (
    <div className="w-full py-8 bg-slate-900">
      <div className="max-w-lg mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="w-full">
            <a 
              href="https://www.intellsys.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                alt="Powered by Intellsys" 
                className="w-full h-auto" 
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/Intellsys3.png"
              />
            </a>
          </div>
          <div className="w-full">
            <a 
              href="https://www.growthjockey.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                alt="Built with Ottocloud" 
                className="w-full h-auto" 
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/Ottocloud3.png"
              />
            </a>
          </div>
          <div className="w-full">
            <a 
              href="https://www.growthjockey.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                alt="Ventured by GrowthJockey" 
                className="w-full h-auto" 
                src="https://iba-consulting-prod.b-cdn.net/gj-logos/GrowthJockey3.png"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

