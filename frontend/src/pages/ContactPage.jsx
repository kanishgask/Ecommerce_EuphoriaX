import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/shared/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: "Our Address", details: "123 EuphoriaX Street, Tech Valley, CA 94043" },
    { icon: Phone, title: "Phone Number", details: "+1 (555) 123-4567" },
    { icon: Mail, title: "Email Address", details: "support@euphoriax.com" },
    { icon: Clock, title: "Business Hours", details: "Mon - Fri: 9:00 AM - 6:00 PM (PST)" },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a question, feedback, or need assistance? Our team is here to help you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card glass={false} className="flex items-start gap-4 p-5 hover:border-blue-500 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{info.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{info.details}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="John Doe" {...register('name')} error={errors.name?.message} />
                  <Input label="Your Email" type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
                </div>
                <Input label="Subject" placeholder="How can we help?" {...register('subject')} error={errors.subject?.message} />
                
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea 
                    className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 min-h-[150px] resize-y"
                    placeholder="Type your message here..."
                    {...register('message')}
                  ></textarea>
                  {errors.message && <p className="text-sm text-red-500 animate-fade-in">{errors.message.message}</p>}
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full md:w-auto mt-4">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Map Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 w-full h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-300 dark:border-slate-700"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="text-center z-10 p-6 glass rounded-xl">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Interactive Map Placeholder</h3>
            <p className="text-sm text-slate-500">Google Maps iframe would be embedded here.</p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
