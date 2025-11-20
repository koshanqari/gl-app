"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Calendar, Building2 } from "lucide-react";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    country_code: "+91",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Fetch event and partner details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        
        if (response.ok) {
          setEvent(data.event);
          
          // Fetch partner details
          const partnerResponse = await fetch(`/api/partners/${data.event.partner_id}`);
          const partnerData = await partnerResponse.json();
          if (partnerResponse.ok) {
            setPartner(partnerData.partner);
          }
        } else {
          console.error('Failed to fetch event:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (exactly 10 digits)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setValidationErrors({});

    // Validate email
    if (!validateEmail(formData.email)) {
      setValidationErrors({ email: 'Please enter a valid email address' });
      setSubmitting(false);
      return;
    }

    // Validate phone (exactly 10 digits)
    if (!validatePhone(formData.phone)) {
      setValidationErrors({ phone: 'Phone number must be exactly 10 digits' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          employee_id: formData.employee_id,
          name: formData.name,
          email: formData.email,
          country_code: formData.country_code,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!event || !partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h1>
            <p className="text-slate-600">The registration link may be invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Registration Successful!
            </h1>
            <p className="text-slate-600 text-center mb-8">
              Thank you for registering for <span className="font-semibold text-slate-900">{event.event_name}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Next Steps:</p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Complete your profile to check in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>View your stay details and roommate information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Access event itinerary and updates</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/member/login')}
              className="w-full"
            >
              Complete Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center border-b bg-white">
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
            <Building2 className="h-4 w-4" />
            <p className="text-sm font-medium">{partner.company_name}</p>
          </div>
          <CardTitle className="text-3xl">{event.event_name}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2">
            <Calendar className="h-4 w-4" />
            Event Registration
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="employee_id">
                  Employee ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => {
                    setFormData({ ...formData, employee_id: e.target.value });
                    setError(null);
                  }}
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setError(null);
                  }}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError(null);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: undefined });
                    }
                  }}
                  onBlur={() => {
                    if (formData.email && !validateEmail(formData.email)) {
                      setValidationErrors({ ...validationErrors, email: 'Please enter a valid email address' });
                    }
                  }}
                  placeholder="your.email@company.com"
                  required
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                  <span className="text-xs text-slate-500 ml-2">(10 digits)</span>
                </Label>
                <PhoneInput
                  countryCode={formData.country_code}
                  phoneNumber={formData.phone}
                  onCountryCodeChange={(value) => {
                    setFormData({ ...formData, country_code: value });
                    setError(null);
                  }}
                  onPhoneNumberChange={(value) => {
                    // Limit to 10 digits
                    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: digitsOnly });
                    setError(null);
                    if (validationErrors.phone && validatePhone(digitsOnly)) {
                      setValidationErrors({ ...validationErrors, phone: undefined });
                    }
                  }}
                  onBlur={() => {
                    if (formData.phone && !validatePhone(formData.phone)) {
                      setValidationErrors({ ...validationErrors, phone: 'Phone number must be exactly 10 digits' });
                    }
                  }}
                  showLabel={false}
                  required
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">{error}</p>
                  {(error.includes('already registered') || error.includes('Please login')) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/member/login')}
                      className="flex-shrink-0 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Register for Event'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

