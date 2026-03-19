import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/50 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-100 text-sm font-medium">Now connecting suppliers across 15+ African countries</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Africa&apos;s Premier<br />
            <span className="text-green-300">B2B Trade Platform</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified manufacturers and distributors. Execute trusted transactions 
            with built-in escrow protection across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=buyer" 
              className="bg-white text-green-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl">
              Find Suppliers
            </Link>
            <Link href="/auth/register?role=supplier"
              className="bg-green-600 border-2 border-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500 transition-all">
              List Your Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Verified Suppliers' },
              { value: '2,000+', label: 'Active Buyers' },
              { value: '15+', label: 'African Countries' },
              { value: '$5M+', label: 'Trade Volume' },
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why TradeGrid Africa?</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Built for African B2B commerce with trust, speed, and reliability at its core.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '✓',
                color: 'bg-green-100 text-green-600',
                title: 'Verified Suppliers',
                desc: 'All suppliers go through our verification process. Trade with confidence knowing your partners are legitimate.',
              },
              {
                icon: '🔒',
                color: 'bg-blue-100 text-blue-600',
                title: 'Escrow Protection',
                desc: 'Our built-in escrow system protects both buyers and sellers. Payment is only released when goods are delivered.',
              },
              {
                icon: '⚡',
                color: 'bg-amber-100 text-amber-600',
                title: 'Fast Transactions',
                desc: 'Streamlined order flow from inquiry to delivery. Reduce friction and close deals faster.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-xl mb-4`}>{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">Simple 4-step process to complete your first trade</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Register', desc: 'Create your account as a supplier or buyer' },
              { step: '2', title: 'Browse', desc: 'Search products by category, location, and price' },
              { step: '3', title: 'Order', desc: 'Place an order request and confirm with the supplier' },
              { step: '4', title: 'Trade', desc: 'Complete payment and delivery through our escrow system' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Start Trading Today</h2>
          <p className="text-green-200 text-lg mb-8">Join thousands of businesses already trading on TradeGrid Africa.</p>
          <Link href="/auth/register" className="bg-white text-green-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center">
        <p className="font-bold text-white text-lg mb-2">TradeGrid Africa</p>
        <p className="text-sm">© 2024 TradeGrid Africa. Connecting Africa&apos;s B2B marketplace.</p>
      </footer>
    </div>
  );
}
