To run it on your own machine you need Node.js (version 18 or newer). You can check with node -v, and get it from nodejs.org if it’s missing.

Get the code. Either clone it, or download the zip from the repo’s green “Code” button and extract it:
   git clone https://github.com/Rishabhkt00/NewtonsRingSimulator.git
   cd NewtonsRingSimulator
Install dependencies:
   npm install

The repo already includes a node_modules folder, but it was installed on another machine and may not match yours. If you hit odd errors, delete node_modules and run npm install again.

Start the dev server:
   npm run dev

Vite will print a local address, usually http://localhost:5173. Open that in your browser. Changes you make to the code show up immediately.
