"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "lehonglinhcd2004@gmail.com" },
  { icon: Phone, label: "Phone", value: "+84 332796941" },
  { icon: MapPin, label: "Location", value: "Cần Thơ, Việt Nam" },
] as const;

const MAP_EMBED_URL = "https://www.google.com/maps?q=CanTho&output=embed";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    try {
      // Thay thế bằng các giá trị thật từ EmailJS dashboard
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, // Service ID
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!, // Template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: "lehonglinhcd2004@gmail.com", // Email nhận
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! // Public Key
      );

      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again later or contact me directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-background to-secondary/30" aria-labelledby="contact-title">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 id="contact-title" className="text-4xl md:text-5xl font-bold">Get In Touch</h2>
            <p className="text-xl text-muted-foreground">Have a project in mind? Let's work together!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info + Map */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card border-border/50">
                <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {CONTACT_INFO.map(({ icon: Icon, label, value }, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Google Map */}
                  <div className="rounded-xl overflow-hidden shadow-md mt-6">
                    <iframe
                      title="My Location in Cần Thơ, Việt Nam"
                      src={MAP_EMBED_URL}
                      width="100%"
                      height="250"
                      loading="lazy"
                      className="rounded-xl border-0"
                      allowFullScreen
                      aria-label="Map showing location in Cần Thơ, Việt Nam"
                    />
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
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell me about your project..."
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange("message")}
                    required
                    aria-required="true"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};