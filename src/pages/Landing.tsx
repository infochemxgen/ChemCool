import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  Beaker, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Database,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Logo } from '../components/Logo';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      title: "Molecular Radar",
      description: "Real-time monitoring of global chemical databases (ECHA, EPA, REACH) to ensure your inventory remains compliant.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "AI Substitution Engine",
      description: "Instantly find safer, sustainable alternatives for hazardous substances using our proprietary molecular matching AI.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Digital Product Passports",
      description: "Full transparency and traceability for every chemical compound in your supply chain, ready for EU DPP compliance.",
      icon: Layers,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ];

  const stats = [
    { label: "Chemicals Monitored", value: "2.4M+" },
    { label: "Regulatory Databases", value: "150+" },
    { label: "Compliance Accuracy", value: "99.9%" },
    { label: "Enterprise Partners", value: "500+" }
  ];

  return (
    <div className="min-h-screen bg-industrial-950 text-slate-200 font-sans selection:bg-accent-emerald/30 selection:text-accent-emerald">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-industrial-950/80 backdrop-blur-xl border-b border-zinc-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-zinc-muted hover:text-white transition-colors uppercase tracking-widest">Features</a>
            <a href="#stats" className="text-sm font-bold text-zinc-muted hover:text-white transition-colors uppercase tracking-widest">Impact</a>
            <Link to="/pricing" className="text-sm font-bold text-zinc-muted hover:text-white transition-colors uppercase tracking-widest">Pricing</Link>
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-accent-emerald text-industrial-950 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all emerald-glow"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="bg-industrial-900 border border-zinc-border text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-industrial-800 transition-all"
              >
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-industrial-900 border-b border-zinc-border p-6 flex flex-col gap-4">
            <a href="#features" className="text-sm font-bold text-zinc-muted uppercase tracking-widest">Features</a>
            <a href="#stats" className="text-sm font-bold text-zinc-muted uppercase tracking-widest">Impact</a>
            <Link to="/pricing" className="text-sm font-bold text-zinc-muted uppercase tracking-widest">Pricing</Link>
            <Link to="/login" className="text-sm font-bold text-white uppercase tracking-widest">Login</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-emerald/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-industrial-900 border border-zinc-border text-[10px] font-black uppercase tracking-[0.2em] text-accent-emerald">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
              </span>
              Next-Gen Molecular Intelligence
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-emerald-400">Chemical Compliance</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-muted font-medium leading-relaxed">
              CHEMXGEN empowers global enterprises to monitor, analyze, and optimize their chemical supply chains with AI-driven precision and real-time regulatory tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-accent-emerald text-industrial-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all emerald-glow flex items-center justify-center group"
              >
                Get Started Now
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto bg-industrial-900 border border-zinc-border text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-industrial-800 transition-all flex items-center justify-center"
              >
                Explore Platform
              </a>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-20 relative"
          >
            <div className="glass-panel rounded-[2.5rem] p-4 border border-zinc-border/50 shadow-2xl overflow-hidden">
              <div className="bg-industrial-950 rounded-[2rem] border border-zinc-border overflow-hidden aspect-video relative">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/chemical/1920/1080?blur=10')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-8 p-12 w-full">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-64 bg-industrial-900/50 border border-zinc-border rounded-2xl p-6 flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center">
                          <Database className="w-6 h-6 text-accent-emerald" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 bg-industrial-800 rounded"></div>
                          <div className="h-4 w-1/2 bg-industrial-800 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 border-y border-zinc-border bg-industrial-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-muted mb-12">Integrated with Global Regulatory Frameworks</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            {["ECHA", "EPA", "REACH", "TSCA", "CLP", "GHS"].map(name => (
              <span key={name} className="text-2xl font-black text-white tracking-widest">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Enterprise-Grade Capabilities</h2>
            <p className="text-zinc-muted max-w-2xl mx-auto font-medium">Built for the most demanding industrial environments, our platform provides end-to-end visibility into your chemical ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-panel p-10 rounded-[2rem] border border-zinc-border hover:border-accent-emerald/30 transition-all group"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-zinc-border group-hover:emerald-glow transition-all", feature.bg)}>
                  <feature.icon className={cn("w-8 h-8", feature.color)} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{feature.title}</h3>
                <p className="text-zinc-muted leading-relaxed font-medium">{feature.description}</p>
                <div className="mt-8 pt-8 border-t border-zinc-border flex items-center text-accent-emerald font-black uppercase tracking-widest text-xs">
                  Learn More <ChevronRight className="ml-2 w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-industrial-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">The CHEMXGEN <br /> Workflow</h2>
              <p className="text-zinc-muted font-medium text-lg leading-relaxed">
                Our platform integrates directly into your existing R&D and supply chain management systems, providing a seamless layer of molecular intelligence.
              </p>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "Data Integration", desc: "Connect your chemical inventory via API or secure batch upload." },
                  { step: "02", title: "Molecular Analysis", desc: "Our AI scans every compound against 150+ global watchlists." },
                  { step: "03", title: "Risk Mitigation", desc: "Receive instant alerts and AI-powered substitution recommendations." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="text-2xl font-black text-accent-emerald/30 group-hover:text-accent-emerald transition-colors">{item.step}</div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-muted font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="glass-panel rounded-[2rem] p-8 border border-zinc-border relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-border pb-4">
                    <span className="text-xs font-black text-accent-emerald uppercase tracking-widest">System Status</span>
                    <span className="text-[10px] font-mono text-zinc-muted">NODE_ACTIVE_042</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-industrial-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "85%" }}
                        className="h-full bg-accent-emerald"
                      ></motion.div>
                    </div>
                    <div className="h-2 w-full bg-industrial-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "62%" }}
                        transition={{ delay: 0.2 }}
                        className="h-full bg-blue-500"
                      ></motion.div>
                    </div>
                    <div className="h-2 w-full bg-industrial-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "94%" }}
                        transition={{ delay: 0.4 }}
                        className="h-full bg-amber-500"
                      ></motion.div>
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="bg-industrial-950 p-4 rounded-xl border border-zinc-border">
                      <div className="text-[10px] font-bold text-zinc-muted uppercase mb-1">Latency</div>
                      <div className="text-lg font-black text-white">12ms</div>
                    </div>
                    <div className="bg-industrial-950 p-4 rounded-xl border border-zinc-border">
                      <div className="text-[10px] font-bold text-zinc-muted uppercase mb-1">Accuracy</div>
                      <div className="text-lg font-black text-white">99.9%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent-emerald/10 blur-[80px] rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Trusted by Industry Leaders</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "CHEMXGEN has fundamentally transformed how we approach regulatory compliance. What used to take weeks of manual research now happens in seconds.",
                author: "Dr. Elena Vance",
                role: "Head of Sustainability, Global Polymers Corp",
                avatar: "EV"
              },
              {
                quote: "The AI Substitution Engine is a game-changer. It allowed us to phase out three hazardous solvents six months ahead of schedule without sacrificing performance.",
                author: "Marcus Thorne",
                role: "Director of R&D, BioTech Solutions",
                avatar: "MT"
              }
            ].map((t, idx) => (
              <div key={idx} className="glass-panel p-10 rounded-[2.5rem] border border-zinc-border relative">
                <div className="absolute top-10 right-10 text-6xl font-black text-industrial-800 opacity-20">"</div>
                <p className="text-xl text-white font-medium leading-relaxed mb-8 relative z-10 italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald font-black">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold uppercase tracking-tight">{t.author}</div>
                    <div className="text-[10px] text-zinc-muted font-black uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-32 bg-industrial-900/50 border-y border-zinc-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-emerald)/0.05,_transparent)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-5xl md:text-6xl font-black text-white tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-accent-emerald">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto glass-panel rounded-[3rem] p-12 md:p-20 border border-zinc-border text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-emerald/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Ready to Secure Your <br /> Supply Chain?
            </h2>
            <p className="text-zinc-muted max-w-xl mx-auto font-medium text-lg">
              Join the world's leading chemical manufacturers and distributors in the transition to digital compliance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-accent-emerald text-industrial-950 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all emerald-glow"
              >
                Create Free Account
              </Link>
              <Link 
                to="/pricing" 
                className="w-full sm:w-auto bg-industrial-900 border border-zinc-border text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-industrial-800 transition-all"
              >
                View Enterprise Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-border bg-industrial-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <Logo size="md" />
              <p className="text-zinc-muted max-w-xs font-medium leading-relaxed">
                Pioneering the intersection of molecular science and digital compliance for a sustainable industrial future.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-muted">
                <li><a href="#" className="hover:text-accent-emerald transition-colors">Radar Monitoring</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">AI Substitutions</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">Digital Passports</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-muted">
                <li><a href="#" className="hover:text-accent-emerald transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">Regulatory Partners</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent-emerald transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-zinc-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-zinc-muted uppercase tracking-widest">© 2026 CHEMXGEN SYSTEMS INC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <Globe className="w-5 h-5 text-zinc-muted hover:text-white cursor-pointer transition-colors" />
              <Cpu className="w-5 h-5 text-zinc-muted hover:text-white cursor-pointer transition-colors" />
              <Database className="w-5 h-5 text-zinc-muted hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
