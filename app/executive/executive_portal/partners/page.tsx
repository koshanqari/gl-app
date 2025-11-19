"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Mail, Phone, Globe, MapPin, Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerDialog } from "@/components/partner-dialog";

export default function PartnersPage() {
  const router = useRouter();
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch partners from database
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/partners');
      const data = await response.json();
      
      if (response.ok) {
        setAllPartners(data.partners);
      } else {
        console.error('Failed to fetch partners:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  // All partners are active (is_active = true from DB)
  const partners = allPartners;

  const handleAddPartner = async (newPartner: any) => {
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh partners list
        await fetchPartners();
        setIsDialogOpen(false);
      } else {
        alert(data.message || 'Failed to create partner');
      }
    } catch (error) {
      console.error('Failed to create partner:', error);
      alert('Failed to create partner. Please try again.');
    }
  };

  const handleEditPartner = async (updatedPartner: any) => {
    try {
      const response = await fetch(`/api/partners/${updatedPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPartner),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh partners list
        await fetchPartners();
        setEditingPartner(null);
        setIsDialogOpen(false);
      } else {
        alert(data.message || 'Failed to update partner');
      }
    } catch (error) {
      console.error('Failed to update partner:', error);
      alert('Failed to update partner. Please try again.');
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) {
      return;
    }

    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh partners list
        await fetchPartners();
      } else {
        alert(data.message || 'Failed to delete partner');
      }
    } catch (error) {
      console.error('Failed to delete partner:', error);
      alert('Failed to delete partner. Please try again.');
    }
  };

  const handleOpenDialog = (partner?: any) => {
    if (partner) {
      setEditingPartner(partner);
    } else {
      setEditingPartner(null);
    }
    setIsDialogOpen(true);
  };

  const handleCardClick = (partnerId: string) => {
    // Use window.location.href for full page load when opening a partner
    window.location.href = `/executive/partner_portal/${partnerId}/events`;
  };

  const handleEditClick = (e: React.MouseEvent, partner: any) => {
    e.stopPropagation(); // Prevent card click
    handleOpenDialog(partner);
  };

  // Filter partners based on search query
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return partners;

    const query = searchQuery.toLowerCase();
    return partners.filter((partner) => {
      // Search in company name
      if (partner.company_name?.toLowerCase().includes(query)) return true;
      
      // Search in industry type
      if (partner.industry_type?.toLowerCase().includes(query)) return true;
      
      // Search in company size
      if (partner.company_size?.toLowerCase().includes(query)) return true;
      
      // Search in city
      if (partner.city?.toLowerCase().includes(query)) return true;
      
      // Search in country
      if (partner.country?.toLowerCase().includes(query)) return true;
      
      // Search in POC names and emails
      if (partner.pocs?.some((poc: any) => 
        poc.name?.toLowerCase().includes(query) || 
        poc.email?.toLowerCase().includes(query)
      )) return true;

      return false;
    });
  }, [partners, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner Management</h1>
          <p className="text-slate-500 mt-1">
            Manage your corporate partners and clients ({partners.length} active)
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search partners by name, industry, location, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading partners...</p>
          </div>
        </div>
      ) : filteredPartners.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No partners found</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first partner"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
          <Card 
            key={partner.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(partner.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{partner.company_name}</CardTitle>
                  <CardDescription className="mt-1">
                    {partner.industry_type || "N/A"} • {partner.company_size || "N/A"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleEditClick(e, partner)}
                  className="flex-shrink-0"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {partner.pocs && partner.pocs.length > 0 && (() => {
                // Show primary POC first, or first POC if no primary is set
                const primaryPOC = partner.pocs.find((poc: any) => poc.is_primary) || partner.pocs[0];
                const isPrimary = primaryPOC?.is_primary || false;
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {partner.pocs.length > 1 ? `${partner.pocs.length} Contacts` : "Contact"}
                      </span>
                      {isPrimary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Building2 className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
                        <span className="font-medium truncate">{primaryPOC.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{primaryPOC.email}</span>
                      </div>
                      {primaryPOC.phone && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
                          <span>{primaryPOC.country_code} {primaryPOC.phone}</span>
                        </div>
                      )}
                    </div>
                    {partner.pocs.length > 1 && (
                      <div className="text-xs text-slate-500 italic pt-1">
                        +{partner.pocs.length - 1} more contact{partner.pocs.length > 2 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {partner.website && (
                <div className="flex items-center text-sm text-slate-600">
                  <Globe className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="truncate">{partner.website}</span>
                </div>
              )}

              {(partner.city || partner.country) && (
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                  <span>
                    {[partner.city, partner.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              {partner.tax_number && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tax Number</span>
                    <span className="font-mono text-xs text-slate-900">
                      {partner.tax_number}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Add/Edit Partner Dialog */}
      <PartnerDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPartner(null);
        }}
        partner={editingPartner}
        onSubmit={editingPartner ? handleEditPartner : handleAddPartner}
      />
    </div>
  );
}

