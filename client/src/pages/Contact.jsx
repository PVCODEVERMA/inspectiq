import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneCall, Mail, MapPin, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Message sent! We'll get back to you within 24 hours.");
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#020001] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-8 text-white/60 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>

                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <h1 className="text-4xl font-black mb-6">Get in <span className="text-[#ED3237]">Touch</span></h1>
                        <p className="text-white/60 mb-12">
                            Have a project in mind? We'd love to hear from you.
                            Our team typically responds within one business day.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#ED3237]/10 flex items-center justify-center">
                                    <PhoneCall className="w-6 h-6 text-[#ED3237]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/40">Call/WhatsApp</p>
                                    <p className="font-bold">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#ED3237]/10 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-[#ED3237]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/40">Email</p>
                                    <p className="font-bold">hello@qcwelding.in</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#ED3237]/10 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-[#ED3237]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/40">Location</p>
                                    <p className="font-bold">Mumbai, Maharashtra, India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Full Name</label>
                                <Input placeholder="John Doe" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Email Address</label>
                                <Input type="email" placeholder="john@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Project Details</label>
                                <Textarea placeholder="Tell us about your project..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px]" required />
                            </div>
                            <Button className="w-full bg-[#ED3237] hover:bg-[#ED3237]/90 h-12 text-white font-bold rounded-xl">
                                Send Message
                                <Send className="w-4 h-4 ml-2" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
