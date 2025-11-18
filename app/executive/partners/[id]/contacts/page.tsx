"use client";

import { useParams } from "next/navigation";
import { Users, Mail, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartnersWithEventCount } from "@/lib/mock-data";

export default function ContactsPage() {
  const params = useParams();
  const partnerId = params.id as string;

  const partner = getPartnersWithEventCount().find(p => p.id === partnerId);

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Partner not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">
            Points of contact for {partner.company_name}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Contacts List */}
      {partner.pocs && partner.pocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partner.pocs.map((poc: any, index: number) => (
            <Card 
              key={index}
              className={poc.isPrimary ? "border-primary bg-primary/5" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{poc.name}</CardTitle>
                      <p className="text-sm text-slate-500">{poc.designation}</p>
                    </div>
                  </div>
                  {poc.isPrimary && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                      Primary
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${poc.email}`} className="hover:text-primary">
                    {poc.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${poc.phone}`} className="hover:text-primary">
                    {poc.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No contacts yet</h3>
              <p className="text-slate-500 mb-6">
                Add contact persons for {partner.company_name}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

