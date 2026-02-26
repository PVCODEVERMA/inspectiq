import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Hammer,
  Shield,
  Award,
  CalendarCheck,
  Wrench,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  Target,
  ChevronRight,
  Star,
  Activity,
  FileCheck,
  Building2,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import logohome from "@/assets/logohome.png";
import Welding_workshop from "@/assets/images/Welding_workshop.avif";
import PaintingInspectorQualityConcept from "@/assets/images/PaintingInspectorQualityConcept.jpg";
import QA_QCEngineer_QualityConcept from "@/assets/images/QA_QCEngineer_QualityConcept.jpg";
import WeldingInspector_QualityConcept from "@/assets/images/WeldingInspector_QualityConcept.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredModule, setHoveredModule] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            if (entry.target.classList.contains("stats-card")) {
              animateValue(entry.target.querySelector(".stat-value"));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const hero = document.querySelector('.hero-content');
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - scrolled * 0.002;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const animateValue = (element) => {
    if (!element) return;
    const value = element.getAttribute('data-value');
    if (!value) return;

    let start = 0;
    const end = parseInt(value);
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        element.textContent = value + (value.includes('%') ? '' : '+');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start) + (value.includes('%') ? '%' : '+');
      }
    }, 16);
  };

  const stats = [
    { value: "48", label: "Active Projects", icon: Hammer, trend: "+12%" },
    { value: "32", label: "Employees", icon: Users2, trend: "+5%" },
    { value: "156", label: "Inspections YTD", icon: Shield, trend: "+23%" },
    { value: "98%", label: "Quality Rate", icon: Award, trend: "+2%" },
    { value: "12", label: "Equipment", icon: Wrench, trend: "3 maintenance" },
    { value: "24/7", label: "Operations", icon: Clock, trend: "Active" },
  ];

  const modules = [
    {
      icon: Users2,
      title: "Employee Management",
      description: "Manage employee records, roles, attendance and performance tracking with real-time updates.",
      features: ["Attendance tracking", "Role management", "Performance metrics"],
      color: "#ED3237"
    },
    {
      icon: Hammer,
      title: "Project Management",
      description: "Monitor welding projects with live progress tracking, resource allocation, and timeline management.",
      features: ["Progress tracking", "Resource planning", "Timeline views"],
      color: "#ED3237"
    },
    {
      icon: Shield,
      title: "Inspection Reports",
      description: "Digital inspection workflows with photo documentation and instant approval routing.",
      features: ["Photo docs", "Auto-approvals", "Compliance checks"],
      color: "#ED3237"
    },
    {
      icon: Award,
      title: "Quality Control",
      description: "Ensure welding standards compliance with automated checks and certification tracking.",
      features: ["Standard checks", "Cert tracking", "Audit trails"],
      color: "#ED3237"
    },
    {
      icon: CalendarCheck,
      title: "Attendance & Payroll",
      description: "Biometric integration and automated payroll calculations with tax compliance.",
      features: ["Biometric sync", "Auto-payroll", "Tax reports"],
      color: "#ED3237"
    },
    {
      icon: Wrench,
      title: "Equipment Monitoring",
      description: "IoT-ready equipment tracking with maintenance alerts and usage analytics.",
      features: ["IoT ready", "Maintenance alerts", "Usage stats"],
      color: "#ED3237"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Real-time dashboards with customizable KPIs and predictive insights.",
      features: ["Custom KPIs", "Predictive insights", "Export data"],
      color: "#ED3237"
    },
    {
      icon: FileCheck,
      title: "Document Control",
      description: "Centralized document management with version control and e-signatures.",
      features: ["Version control", "E-signatures", "Secure storage"],
      color: "#ED3237"
    },
    {
      icon: Building2,
      title: "Site Management",
      description: "Multi-site operations management with location-based access control.",
      features: ["Multi-site", "Geo-fencing", "Site analytics"],
      color: "#ED3237"
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Project Manager",
      content: "This CRM has transformed how we manage our welding projects. Real-time updates and intuitive interface.",
      rating: 5,
      image: PaintingInspectorQualityConcept
    },
    {
      name: "Priya Sharma",
      role: "Quality Head",
      content: "The inspection module alone saved us 20 hours per week. Excellent tool for quality control.",
      rating: 5,
      image: QA_QCEngineer_QualityConcept
    },
    {
      name: "Amit Verma",
      role: "Site Supervisor",
      content: "Equipment monitoring alerts have prevented major breakdowns. Worth every penny.",
      rating: 5,
      image: WeldingInspector_QualityConcept
    }
  ];

  return (
    <div className="min-h-screen bg-[#020001] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ED3237]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ED3237]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#ED3237]/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#ED3237]/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[#ED3237]/10 rounded-full"></div>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b border-black/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div>
              <img src={logohome} alt="QCWS" className="w-full max-w-[120px] sm:max-w-none h-auto sm:h-12 object-contain transition-transform group-hover:scale-110" />
            </div>
            <div>

            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-black/70 hover:text-black hover:bg-black/5 font-bold"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-black/70 hover:text-black hover:bg-black/5 font-bold"
            >
              About
            </Button>
            <button
              onClick={() => navigate("/auth")}
              className="user-profile"
              aria-label="User Login Button"
            >
              <div className="user-profile-inner">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <g data-name="Layer 2" id="Layer_2">
                    <path
                      d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"
                    ></path>
                  </g>
                </svg>
                <p>Log In</p>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-[20%] sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-content reveal">


              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-white">Enterprise</span>
                <br />
                <span className="text-[#ED3237]">CRM Dashboard</span>
              </h1>

              <p className="text-white/60 text-base sm:text-lg mb-8 max-w-xl">
                Internal management system for monitoring projects, employees,
                reports and operations of Quality Concept Welding Solutions Pvt. Ltd.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="bg-[#ED3237] hover:bg-[#ED3237]/90 text-white px-8 h-12 sm:h-14 rounded-full font-bold relative group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform"></div>
                </Button>


              </div>

              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ED3237] to-[#ED3237]/50 border-2 border-[#020001]"></div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#020001] flex items-center justify-center text-xs font-bold">
                    +12
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold">Team of 50+</p>
                </div>
              </div>
            </div>

            {/* Hero visualization */}
            <div className="relative reveal lg:block hidden">
              <div className="relative z-10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="w-8 h-8 bg-[#ED3237]/20 rounded-xl flex items-center justify-center mb-3">
                      <Activity className="w-4 h-4 text-[#ED3237]" />
                    </div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-white/50">Quality Rate</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="w-8 h-8 bg-[#ED3237]/20 rounded-xl flex items-center justify-center mb-3">
                      <Target className="w-4 h-4 text-[#ED3237]" />
                    </div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-xs text-white/50">Operations</p>
                  </div>
                  <div className="col-span-2 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">Project Progress</span>
                      <span className="text-xs text-[#ED3237]">+23%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#ED3237] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#ED3237]/20 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="stats-card reveal group p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#ED3237]/40 transition-all hover:translate-y-[-4px] relative overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#ED3237]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#ED3237] mb-2 sm:mb-3 relative z-10" />
                <h3 className="stat-value text-xl sm:text-2xl font-bold relative z-10" data-value={stat.value}>
                  0
                </h3>
                <p className="text-white/50 text-[10px] sm:text-xs uppercase tracking-wider mb-1 relative z-10">
                  {stat.label}
                </p>
                <p className="text-[8px] sm:text-[10px] text-[#ED3237] relative z-10">
                  {stat.trend}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              <span className="text-white">Operational</span>{" "}
              <span className="text-[#ED3237]">Modules</span>
            </h2>
            <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto">
              Core management modules designed for internal company operations.
              Each module integrates seamlessly for maximum efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {modules.map((module, index) => (
              <div
                key={module.title}
                className="module-card reveal group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-[#ED3237]/40 transition-all hover:translate-y-[-8px] cursor-pointer relative overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredModule(index)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#ED3237]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#ED3237]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <module.icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#ED3237]" />
                    </div>
                    {hoveredModule === index && (
                      <ChevronRight className="w-5 h-5 text-[#ED3237] animate-pulse" />
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-[#ED3237] transition-colors">
                    {module.title}
                  </h3>

                  <p className="text-white/60 text-sm sm:text-base mb-4">
                    {module.description}
                  </p>

                  <div className="space-y-2">
                    {module.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-white/50">
                        <CheckCircle2 className="w-3 h-3 text-[#ED3237]" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-[#ED3237] font-medium">Learn more →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-6">
                <Star className="w-4 h-4 text-[#ED3237]" />
                <span className="text-sm font-medium">Why Choose QCWS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black mb-6">
                <span className="text-white">Built for</span>
                <br />
                <span className="text-[#ED3237]">Welding Excellence</span>
              </h2>

              <p className="text-white/60 mb-8">
                Our CRM is specifically designed for welding solutions companies,
                with features that address the unique challenges of your industry.
              </p>

              <div className="space-y-4">
                {[
                  "Real-time project tracking with welding-specific metrics",
                  "Automated quality control workflows for welding inspections",
                  "Equipment maintenance schedules and alerts",
                  "Mobile-ready interface for site supervisors",
                  "Comprehensive reporting and analytics"
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#ED3237] flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>


            </div>

            <div className="relative reveal">
              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={Welding_workshop}
                  alt="Welding workshop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020001] to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Current Projects</p>
                        <p className="text-2xl font-bold">48 <span className="text-xs text-[#ED3237]">+12%</span></p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Efficiency</p>
                        <p className="text-2xl font-bold">94%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              <span className="text-white">Trusted by</span>{" "}
              <span className="text-[#ED3237]">Industry Leaders</span>
            </h2>
            <p className="text-white/60">What our team members say about QCWS CRM</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="reveal p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ED3237]/40 transition-all"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-[#ED3237]"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-white/50">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#ED3237] text-[#ED3237]" />
                  ))}
                </div>
                <p className="text-white/70 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ED3237]/20 to-transparent blur-3xl"></div>
          <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              Ready to streamline your operations?
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Join industry leaders who trust QCWS CRM for their welding solutions management
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="bg-[#ED3237] hover:bg-[#ED3237]/90 text-white px-8 h-12 rounded-full font-bold"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <button
                onClick={() => navigate("/auth")}
                className="user-profile"
                aria-label="User Login Button"
              >
                <div className="user-profile-inner">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g data-name="Layer 2" id="Layer_2">
                      <path
                        d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"
                      ></path>
                    </g>
                  </svg>
                  <p>Log In</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERNAL NOTICE */}
      <section className="py-12 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center px-4 reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ED3237]/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#ED3237]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">
            Restricted Internal Access
          </h3>
          <p className="text-white/60 text-sm sm:text-base">
            This CRM system is developed exclusively for internal operational
            management of Quality Concept Welding Solutions Pvt. Ltd.
          </p>
        </div>
      </section>

      <Footer />

      {/* Animation Style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hero-content {
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .stats-card, .module-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .module-card:hover {
          box-shadow: 0 20px 40px -15px rgba(247, 93, 11, 0.3);
        }
        
        @media (max-width: 640px) {
          .module-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;