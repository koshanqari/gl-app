"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Country {
  name: string;
  Iso2: string;
  Iso3: string;
}

interface State {
  name: string;
  state_code: string;
}

interface City {
  name: string;
}

interface AddressInputProps {
  country: string;
  pincode: string;
  state: string;
  city: string;
  addressLane: string;
  onCountryChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressLaneChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function AddressInput({
  country,
  pincode,
  state,
  city,
  addressLane,
  onCountryChange,
  onPincodeChange,
  onStateChange,
  onCityChange,
  onAddressLaneChange,
  disabled = false,
  required = false,
}: AddressInputProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);
  
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  
  // Search states
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  
  // Popover states
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (country && countries.length > 0) {
      console.log('Country changed to:', country, 'Fetching states...');
      fetchStates(country);
    } else if (!country) {
      setStates([]);
      setCities([]);
    }
  }, [country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (country && state) {
      fetchCities(country, state);
    } else if (!state) {
      setCities([]);
    }
  }, [state, country]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
      const data = await response.json();
      
      if (data.error === false && data.data) {
        const validCountries = data.data.filter((c: Country) => c.Iso2 && c.name);
        setCountries(validCountries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryCode: string) => {
    setLoadingStates(true);
    setStates([]);
    try {
      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/states/q?iso2=${countryCode}`);
      const data = await response.json();
      
      if (data.error === false && data.data && data.data.states) {
        setStates(data.data.states);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (countryName: string, stateName: string) => {
    setLoadingCities(true);
    setCities([]);
    try {
      const selectedCountry = countries.find(c => c.Iso2 === countryName);
      if (!selectedCountry) {
        setLoadingCities(false);
        return;
      }

      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/state/cities/q?country=${encodeURIComponent(selectedCountry.name)}&state=${encodeURIComponent(stateName)}`);
      const data = await response.json();
      
      if (data.error === false && data.data) {
        setCities(data.data.map((cityName: string) => ({ name: cityName })));
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchPincodeData = async (pincodeValue: string) => {
    if (country !== "IN" || !pincodeValue || pincodeValue.length !== 6) {
      setPincodeAutoFilled(false);
      return;
    }

    setLoadingPincode(true);
    setPincodeError("");

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincodeValue}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        onStateChange(postOffice.State || "");
        onCityChange(postOffice.District || "");
        setPincodeError("");
        setPincodeAutoFilled(true);
      } else {
        setPincodeError("Invalid pincode");
        onStateChange("");
        onCityChange("");
        setPincodeAutoFilled(false);
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      setPincodeError("Failed to fetch pincode data");
      setPincodeAutoFilled(false);
    } finally {
      setLoadingPincode(false);
    }
  };

  useEffect(() => {
    if (country === "IN" && pincode.length === 6) {
      const timer = setTimeout(() => {
        fetchPincodeData(pincode);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPincodeAutoFilled(false);
    }
  }, [pincode, country]);

  const selectedCountry = countries.find((c) => c.Iso2 === country);
  
  // Filtered lists for search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.Iso2.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);
  
  const filteredStates = useMemo(() => {
    if (!stateSearch) return states;
    return states.filter((s) =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [states, stateSearch]);
  
  const filteredCities = useMemo(() => {
    if (!citySearch) return cities;
    return cities.filter((c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [cities, citySearch]);

  return (
    <div className="space-y-4">
      {/* Row 1: Country and Pincode */}
      <div className="grid grid-cols-2 gap-4">
        {/* Country Select with Search */}
        <div>
          <Label htmlFor="country">
            Country {required && <span className="text-red-500">*</span>}
          </Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                type="button"
                aria-expanded={countryOpen}
                className="w-full justify-between"
                disabled={disabled || loadingCountries}
              >
                {loadingCountries
                  ? "Loading..."
                  : selectedCountry
                  ? selectedCountry.name
                  : "Select country..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="flex flex-col">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {loadingCountries ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : filteredCountries.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">
                      No country found.
                    </div>
                  ) : (
                    filteredCountries.map((c) => (
                      <button
                        key={c.Iso2}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Country selected:', c.Iso2);
                          onCountryChange(c.Iso2);
                          onStateChange("");
                          onCityChange("");
                          setPincodeAutoFilled(false);
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                        className={cn(
                          "w-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors text-left",
                          country === c.Iso2 && "bg-slate-50"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            country === c.Iso2 ? "opacity-100 text-slate-900" : "opacity-0"
                          )}
                        />
                        <span className="text-sm text-slate-900">{c.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Pincode */}
        <div>
          <Label htmlFor="pincode">
            Pincode {required && <span className="text-red-500">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                onPincodeChange(value);
              }}
              placeholder="Enter pincode"
              disabled={disabled || !country}
              maxLength={country === "IN" ? 6 : 10}
              className={pincodeError ? "border-red-500" : ""}
            />
            {loadingPincode && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
          {pincodeError && (
            <p className="text-xs text-red-500 mt-1">{pincodeError}</p>
          )}
          {country === "IN" && pincode.length < 6 && !pincodeError && (
            <p className="text-xs text-slate-500 mt-1">Enter 6-digit pincode to auto-fill</p>
          )}
          {pincodeAutoFilled && (
            <p className="text-xs text-green-600 mt-1">Auto-filled (you can change manually)</p>
          )}
        </div>
      </div>

      {/* Row 2: State and City */}
      <div className="grid grid-cols-2 gap-4">
        {/* State Select with Search */}
        <div>
          <Label htmlFor="state">
            State {required && <span className="text-red-500">*</span>}
          </Label>
          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                type="button"
                aria-expanded={stateOpen}
                className="w-full justify-between"
                disabled={disabled || !country || loadingStates}
              >
                {loadingStates ? "Loading..." : state || "Select state..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="flex flex-col">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {loadingStates ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : filteredStates.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">
                      {country ? "No state found." : "Select a country first."}
                    </div>
                  ) : (
                    filteredStates.map((s) => (
                      <button
                        key={s.state_code}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('State selected:', s.name);
                          onStateChange(s.name);
                          onCityChange("");
                          setPincodeAutoFilled(false);
                          setStateOpen(false);
                          setStateSearch("");
                        }}
                        className={cn(
                          "w-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors text-left",
                          state === s.name && "bg-slate-50"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            state === s.name ? "opacity-100 text-slate-900" : "opacity-0"
                          )}
                        />
                        <span className="text-sm text-slate-900">{s.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* City Select with Search */}
        <div>
          <Label htmlFor="city">
            City {required && <span className="text-red-500">*</span>}
          </Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                type="button"
                aria-expanded={cityOpen}
                className="w-full justify-between"
                disabled={disabled || !state || loadingCities}
              >
                {loadingCities ? "Loading..." : city || "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <div className="flex flex-col">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {loadingCities ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-500">
                      {state ? "No city found." : "Select a state first."}
                    </div>
                  ) : (
                    filteredCities.map((c, index) => (
                      <button
                        key={`${c.name}-${index}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('City selected:', c.name);
                          onCityChange(c.name);
                          setPincodeAutoFilled(false);
                          setCityOpen(false);
                          setCitySearch("");
                        }}
                        className={cn(
                          "w-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors text-left",
                          city === c.name && "bg-slate-50"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            city === c.name ? "opacity-100 text-slate-900" : "opacity-0"
                          )}
                        />
                        <span className="text-sm text-slate-900">{c.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Row 3: Street Address */}
      <div>
        <Label htmlFor="addressLane">
          Street Address {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="addressLane"
          value={addressLane}
          onChange={(e) => onAddressLaneChange(e.target.value)}
          placeholder="Enter street address"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
