'use client';

export default function TestDashboard() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-solana-green to-blue-500 bg-clip-text text-transparent">
          Dashboard Styling Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-solana-green to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">CSS Working!</h3>
                <p className="text-gray-500">All styles loaded correctly</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              If you can see this card with colors, gradients, and proper styling, 
              then Tailwind CSS is working perfectly.
            </p>
          </div>

          {/* Test Card 2 */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-500 mb-4">Color Test</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-solana-green rounded-full"></div>
                <span>Solana Green</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span>Purple</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Blue</span>
              </div>
            </div>
          </div>

          {/* Test Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">Interactive Test</h3>
            <button className="w-full py-3 bg-gradient-to-r from-solana-green to-emerald-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
              Hover Me!
            </button>
          </div>

          {/* Test Card 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4">Theme Test</h3>
            <div className="text-sm space-y-2">
              <p>Background: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Working</span></p>
              <p>Text: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Working</span></p>
              <p>Borders: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Working</span></p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Tailwind CSS is fully operational!</span>
          </div>
        </div>
      </div>
    </div>
  );
}