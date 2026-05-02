import React from "react";
import { Building2, BookOpen, Library, TreePine, Shield, Star, MapPin, ImageIcon } from "lucide-react";

const iconMap = {
  Building2,
  BookOpen,
  Library,
  TreePine,
  Shield,
  Star,
  MapPin,
};

export default function TourHighlightCard({ highlight }) {
  const Icon = iconMap[highlight.icon] || Star;

  // Get image source: gallery item or direct URL
  const getImageUrl = () => {
    if (highlight.imageSourceType === "gallery" && highlight.galleryItem?.image_url) {
      return highlight.galleryItem.image_url;
    }
    return highlight.imageUrl;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
      {imageUrl ? (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={highlight.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      ) : (
        <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {!highlight.image && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-orange-600" />
            </div>
          )}
          <h3 className="font-bold text-gray-900 text-lg">{highlight.title}</h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{highlight.description}</p>
      </div>
    </div>
  );
}