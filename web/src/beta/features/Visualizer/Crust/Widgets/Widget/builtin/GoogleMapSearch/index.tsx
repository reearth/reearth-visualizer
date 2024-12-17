import { Loader } from "@googlemaps/js-api-loader";
import { Card } from "@reearth/beta/lib/reearth-widget-ui/components/ui/card";
import { Input } from "@reearth/beta/lib/reearth-widget-ui/components/ui/input";
import { Search, Trash2, MapPin } from "lucide-react";
import { FC, useMemo, useState, useEffect, useCallback } from "react";

import type { ComponentProps as WidgetProps } from "../..";
import { CommonBuiltInWidgetProperty } from "../types";

type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiToken?: string;
  };
};
type GoogleMapSearchProps = WidgetProps<Property>;

const apiKey = "AIzaSyB8gCkz0-XV0P4wtC1X8CoidAocS8Wt4ko"; // 使用真实的 API Key，不要在其他地方重复初始化loader

let loaderInstance: Loader | null = null;
function getLoaderInstance(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey,
      libraries: ["places"]
    });
  }
  return loaderInstance;
}

const GoogleMapSearch: FC<GoogleMapSearchProps> = ({ widget }) => {
  const theme = useMemo(
    () => widget.property?.appearance?.theme ?? "light",
    [widget.property?.appearance?.theme]
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // 使用单例 Loader 实例
  useEffect(() => {
    const loader = getLoaderInstance();
    loader
      .load()
      .then(() => {
        setGoogleLoaded(true);
      })
      .catch((err) => {
        setError("Failed to load Google Maps JS API: " + err);
      });
  }, []);

  // Debounce effect for query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 3000);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchSuggestions = useCallback(
    (searchText: string) => {
      if (!googleLoaded || !searchText) return;

      if (searchText.length === 0) {
        setFilteredSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      setFilteredSuggestions([]);

      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      const request = {
        query: searchText
      };

      service.textSearch(request, (results, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setFilteredSuggestions(results);
        } else {
          setError("Failed to fetch suggestions.");
          setFilteredSuggestions([]);
        }
      });
    },
    [googleLoaded]
  );

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setDebouncedQuery(query);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedItems((prev) => [...prev, item]);
    setDebouncedQuery("");
    setQuery("");
    setFilteredSuggestions([]);
  };

  const handleDeleteItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={theme}>
      <Card className="tw-pl-3 tw-w-[400px] tw-flex tw-flex-col tw-bg-background tw-text-foreground tw-rounded-md tw-border-0">
        <div className="tw-flex tw-items-center">
          <span className="tw-text-foreground">
            <Search className="tw-w-5 tw-h-5" />
          </span>
          <Input
            className="tw-border-0"
            placeholder="Type a keyword to search..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {loading && <p className="tw-text-gray-500 tw-mt-2">Loading...</p>}
        {error && <p className="tw-text-red-500 tw-mt-2">{error}</p>}
        {filteredSuggestions.length > 0 && (
          <ul className="tw-mt-2 tw-bg-white tw-rounded-md tw-shadow-lg tw-max-h-60 tw-overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="tw-px-4 tw-py-2 tw-cursor-pointer hover:tw-bg-gray-200"
                onClick={() => handleSelectItem(suggestion)}
              >
                {`${suggestion.formatted_address}, ${suggestion.name}`}
              </li>
            ))}
          </ul>
        )}

        {selectedItems.length > 0 && (
          <div className="tw-mt-2 tw-mb-2 tw-space-y-2">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-bg-gray-100 tw-rounded-md"
              >
                <div className="tw-flex tw-items-center">
                  <MapPin className="tw-w-5 tw-h-5 tw-mr-2 tw-flex-shrink-0" />
                  <span>{`${item.formatted_address}, ${item.name}`}</span>
                </div>
                <Trash2
                  className="tw-w-5 tw-h-5 tw-cursor-pointer hover:tw-text-red-500  tw-flex-shrink-0"
                  onClick={() => handleDeleteItem(index)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GoogleMapSearch;
