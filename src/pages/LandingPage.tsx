import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  FileText, 
  PenTool, 
  Download, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Home,
  Car,
  Briefcase,
  Banknote,
  Map,
  Users
} from "lucide-react";

const categories = [
  { id: "rental", title: "Rental", icon: Home, color: "bg-blue-50 text-blue-600" },
  { id: "car_sale", title: "Car Sale", icon: Car, color: "bg-orange-50 text-orange-600" },
  { id: "employment", title: "Employment", icon: Briefcase, color: "bg-green-50 text-green-600" },
  { id: "loan", title: "Loan", icon: Banknote, color: "bg-purple-50 text-purple-600" },
  { id: "land", title: "Land", icon: Map, color: "bg-amber-50 text-amber-600" },
  { id: "partnership", title: "Partnership", icon: Users, color: "bg-rose-50 text-rose-600" },
];

const features = [
  {
    title: "Browse Templates",
    description: "Access a library of legally structured templates tailored for Tanzania.",
    icon: FileText,
  },
  {
    title: "Fill & Download",
    description: "Fill in the details directly on the document and download as PDF.",
    icon: Download,
  },
  {
    title: "Sign Digitally",
    description: "Apply secure digital signatures to your contracts in seconds.",
    icon: PenTool,
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-50/50 blur-3xl rounded-full opacity-50" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-brand-700 uppercase bg-brand-100 rounded-full">
              Contract Platform for Tanzania
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
              Create Legal Contracts <br />
              <span className="text-brand-600">in Minutes.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              Mikataba provides legally structured templates for rental agreements, vehicle sales, 
              employment, and more. Fill, sign, and download professionally.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/templates" className="btn-primary px-8 py-4 text-lg flex items-center gap-2">
                Browse Templates <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-4 text-lg">
                Get Started for Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              A simple three-step process to get your legally binding documents ready.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Contract Categories</h2>
              <p className="text-slate-600">Choose from our wide range of professional templates.</p>
            </div>
            <Link to="/templates" className="text-brand-600 font-semibold flex items-center gap-2 hover:underline">
              View all templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  to={`/templates?category=${cat.id}`}
                  className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all group text-center h-full"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-900">{cat.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-brand-600 text-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              Legally Structured <br /> & Secure.
            </h2>
            <div className="space-y-6">
              {[
                "Compliant with Tanzanian laws and regulations.",
                "Secure digital signatures with audit trails.",
                "Private and encrypted data storage.",
                "Easy to use on mobile and desktop."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand-300 shrink-0" />
                  <span className="text-lg text-brand-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <Shield className="w-12 h-12 text-brand-300" />
                <div>
                  <h4 className="text-xl font-bold">Lawyer Review</h4>
                  <p className="text-brand-100">Optional professional review for peace of mind.</p>
                </div>
              </div>
              <p className="text-brand-50 mb-8 leading-relaxed">
                Need extra assurance? You can request a basic lawyer review of your filled contract 
                directly through our platform.
              </p>
              <Link to="/register" className="inline-block w-full text-center bg-white text-brand-600 font-bold py-4 rounded-xl hover:bg-brand-50 transition-colors">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
