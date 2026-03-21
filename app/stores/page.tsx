"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { trpc } from "@/lib/trpc/client";

export default function StoresPage() {
  const { data: storesData, isLoading } = trpc.stores.list.useQuery();
  const stores = storesData || [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Stores" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-body text-evol-metallic">Loading stores...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <h1 className="font-serif text-5xl md:text-7xl text-evol-dark-grey">
            Visit Us
          </h1>
          <p className="font-body text-lg md:text-xl text-evol-metallic leading-relaxed max-w-3xl mx-auto">
            Experience our collections in person. Our spaces are designed for quiet
            contemplation and meaningful conversation.
          </p>
        </motion.div>
      </section>

      {/* Store List */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-8">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-evol-light-grey p-8 md:p-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Store Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl text-evol-dark-grey mb-2">
                      {store.name}
                    </h2>
                    <p className="font-sans text-sm uppercase tracking-widest text-evol-metallic">
                      {store.city}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex gap-4">
                      <div className="shrink-0 h-6 w-6 flex items-center justify-center text-evol-red">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-1">
                          Address
                        </h3>
                        <p className="font-body text-sm text-evol-metallic">
                          {store.address}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-4">
                      <div className="shrink-0 h-6 w-6 flex items-center justify-center text-evol-red">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-1">
                          Phone
                        </h3>
                        <a
                          href={`tel:${store.phone.replace(/\s/g, "")}`}
                          className="font-body text-sm text-evol-metallic hover:text-evol-red transition-colors"
                        >
                          {store.phone}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-4">
                      <div className="shrink-0 h-6 w-6 flex items-center justify-center text-evol-red">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-1">
                          Email
                        </h3>
                        <a
                          href={`mailto:${store.email}`}
                          className="font-body text-sm text-evol-metallic hover:text-evol-red transition-colors"
                        >
                          {store.email}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-4">
                      <div className="shrink-0 h-6 w-6 flex items-center justify-center text-evol-red">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-sans text-xs uppercase tracking-widest text-evol-dark-grey mb-1">
                          Hours
                        </h3>
                        <p className="font-body text-sm text-evol-metallic">
                          {store.openingHours}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col justify-center space-y-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      store.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" className="w-full">
                      Get Directions
                    </Button>
                  </a>
                  <a href={`tel:${store.phone.replace(/\s/g, "")}`}>
                    <Button variant="secondary" className="w-full">
                      Call Store
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-evol-off-white py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-evol-dark-grey">
              Questions?
            </h2>
            <p className="font-body text-lg text-evol-metallic">
              We're here to help. Reach out for guidance on selections, customisation,
              or anything else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:sadiya.siddiqui@evoljewels.com">
                <Button variant="primary">Email Us</Button>
              </a>
              <a
                href="https://wa.me/919963661025"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary">WhatsApp</Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
