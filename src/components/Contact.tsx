"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "lehonglinhcd2004@gmail.com" },
    { icon: Phone, label: "Phone", value: "+84 332796941" },
    { icon: MapPin, label: "Location", value: "Cần Thơ, Việt Nam" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Get In Touch</h2>
            <p className="text-xl text-muted-foreground">
              Have a project in mind? Let's work together!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info + Map */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card border-border/50">
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{info.label}</p>
                          <p className="font-medium">{info.value}</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Google Map */}
                  <div className="rounded-xl overflow-hidden shadow-md mt-6">
                    <iframe
                      title="My Location"
                      src="https://www.google.com/maps?q=CanTho&output=embed"
                      width="100%"
                      height="250"
                      loading="lazy"
                      className="rounded-xl border-0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary-glow/5">
                <h3 className="text-xl font-semibold mb-3">Looking for a developer?</h3>
                <p className="text-muted-foreground mb-4">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all">
                  Schedule a Call
                </Button>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-6 shadow-card border-border/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Tell me about your project..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all"
                >
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
