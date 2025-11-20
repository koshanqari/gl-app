"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MobileCard,
  MobileCardHeader,
  MobileCardContent,
  MobileInfoRow,
  MobileStatCard,
  MobileContainer,
  MobileEmptyState,
} from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { 
  Home, 
  MapPin, 
  Phone, 
  Users, 
  BedDouble,
  ExternalLink,
  Mail
} from "lucide-react";

export default function MemberStayPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const {
    memberData,
    hotel,
    hotelImageUrl,
    roomAssignment,
    roommates,
    isKYCComplete,
  } = useMemberEventData();

  // Data is already preloaded from context, no need to fetch
  if (!memberData || !isKYCComplete) {
    return (
      <MobileContainer>
        <KYCRequiredMessage eventId={eventId} />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Room Assignment Card */}
      <MobileCard>
        <MobileCardHeader>Room Assignment</MobileCardHeader>
        <MobileCardContent>
          {roomAssignment && roomAssignment.room_number ? (
            <>
              {/* Room Details */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <MobileStatCard
                  icon={BedDouble}
                  label="Room Number"
                  value={roomAssignment.room_number}
                />
                <MobileStatCard
                  icon={Home}
                  label="Room Type"
                  value={<span className="text-sm font-semibold text-slate-900 capitalize">{roomAssignment.room_type}</span>}
                />
              </div>

              {/* Sharing With */}
              {roommates.length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Sharing With
                    </h3>
                    <div className="px-2 py-0.5 bg-slate-100 rounded-full">
                      <span className="text-xs font-semibold text-slate-700">{roommates.length}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {roommates.map((roommate, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-slate-900 truncate">
                              {roommate.name}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 ml-13">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{roommate.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{roommate.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BedDouble className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900 mb-2">
                No Room Assigned Yet
              </p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Your room assignment will be available soon
              </p>
            </div>
          )}
        </MobileCardContent>
      </MobileCard>

      {/* Hotel Information */}
      <MobileCard>
        <MobileCardHeader>Stay Details</MobileCardHeader>
        <MobileCardContent>
          {hotel ? (
            <div className="space-y-5">
              {/* Hotel Image */}
              {hotelImageUrl && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={hotelImageUrl}
                    alt={hotel.hotel_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Hotel Name & Rating */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight flex-1">
                    {hotel.hotel_name}
                  </h3>
                  {hotel.star_rating && (
                    <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                      <span className="text-sm font-bold text-slate-900">{hotel.star_rating} Star</span>
                    </div>
                  )}
                </div>
                
                {/* Website */}
                {hotel.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 rounded-xl font-semibold mb-4"
                    onClick={() => window.open(hotel.website, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
                
              <div className="space-y-4 pt-2">
                <MobileInfoRow
                  icon={MapPin}
                  label="Address"
                  value={
                    <div>
                      <p className="text-sm text-slate-900 leading-relaxed">
                        {[
                          hotel.address_street,
                          hotel.city,
                          hotel.state,
                          hotel.pincode,
                          hotel.country
                        ].filter(Boolean).join(', ')}
                      </p>
                      {hotel.maps_link && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-primary text-sm mt-2 font-semibold"
                          onClick={() => window.open(hotel.maps_link, "_blank")}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View on Maps
                        </Button>
                      )}
                    </div>
                  }
                />
                
                {hotel.pocs && hotel.pocs.length > 0 && (
                  <MobileInfoRow
                    icon={Phone}
                    label="Contact"
                    value={
                      <div className="space-y-2">
                        {hotel.pocs
                          .filter((poc: any) => poc.display_for_members)
                          .slice(0, 2)
                          .map((poc: any, idx: number) => (
                            <div key={idx}>
                              <p className="text-sm font-semibold text-slate-900">{poc.name} ({poc.poc_for})</p>
                              <p className="text-sm text-slate-600 mt-0.5">{poc.phone}</p>
                            </div>
                          ))}
                      </div>
                    }
                  />
                )}
              </div>

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-xs font-medium text-slate-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {hotel.additional_details && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Additional Information</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{hotel.additional_details}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-900 mb-2">
                Hotel Details Coming Soon
              </p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Accommodation details will be available soon
              </p>
            </div>
          )}
        </MobileCardContent>
      </MobileCard>
    </MobileContainer>
  );
}

