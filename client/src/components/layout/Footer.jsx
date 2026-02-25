import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/qcws-logo.png';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="relative bg-[#000000] border-t  overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#000000] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Quality Concept Welding Solutions" className="w-12 h-12 rounded-xl bg-white p-1" />
                            <div className="text-sidebar-foreground">
                                <h2 className="font-display font-bold text-xl leading-tight">Quality Concept</h2>
                                <p className="text-xs text-sidebar-foreground/50">Welding Solutions Pvt. Ltd.</p>
                            </div>
                        </div>
                        <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-xs">
                            Professional welding services for personal projects, repairs, and custom metal fabrication.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-primary hover:bg-primary/10 transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-primary hover:bg-primary/10 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-primary hover:bg-primary/10 transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/70 hover:text-primary hover:bg-primary/10 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="font-display font-bold text-sidebar-foreground uppercase tracking-widest text-xs">Platform</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/dashboard" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/inspections" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Inspections</Link>
                            </li>
                            <li>
                                <Link to="/reports" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Reports</Link>
                            </li>
                            <li>
                                <Link to="/analytics" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Analytics</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal / Social */}
                    <div className="space-y-6">
                        <h3 className="font-display font-bold text-sidebar-foreground uppercase tracking-widest text-xs">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Help Center</a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Terms of Service</a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors">Cookie Policy</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        <h3 className="font-display font-bold text-sidebar-foreground uppercase tracking-widest text-xs">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm text-sidebar-foreground/60">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>Suite 101, Business District,<br />City Center, India</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-sidebar-foreground/60">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-sidebar-foreground/60">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>support@qualityconcept.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-sidebar-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-sidebar-foreground/40 italic">
                        Quality Concept Welding Solutions - Precision & Strength
                    </p>
                    <p className="text-xs text-sidebar-foreground/40">
                        &copy; {new Date().getFullYear()} QC Welding Solutions. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
