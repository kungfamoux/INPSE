import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin, Facebook, Mail, Phone, Star, Users, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80";

function TeamCard({ member, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(member)}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 ${member.is_featured ? "ring-2 ring-orange-400 ring-offset-2" : ""}`}
    >
      {/* Photo */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={member.photo_url || FALLBACK_PHOTO}
          alt={member.full_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = FALLBACK_PHOTO; }}
        />
        {member.is_featured && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> Featured
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Social links on hover */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.facebook_url && (
            <a href={member.facebook_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-blue-800 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`}
              onClick={e => e.stopPropagation()}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        {member.department && (
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">{member.department}</span>
        )}
        <h3 className="text-lg font-bold text-gray-900 mt-1 mb-0.5">{member.full_name}</h3>
        <p className="text-sm text-gray-500 font-medium mb-3">{member.position}</p>
        {member.bio && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{member.bio}</p>
        )}
        {member.bio && member.bio.length > 100 && (
          <button className="text-xs text-orange-500 hover:text-orange-600 font-medium mt-2 flex items-center gap-1">
            Read more <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function MemberModal({ member, onClose }) {
  if (!member) return null;
  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">{member.full_name}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-5 items-start">
          <img
            src={member.photo_url || FALLBACK_PHOTO}
            alt={member.full_name}
            onError={e => { e.target.src = FALLBACK_PHOTO; }}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow"
          />
          <div>
            {member.department && (
              <Badge className="mb-1 bg-orange-100 text-orange-700 border-0 text-xs">{member.department}</Badge>
            )}
            <h2 className="text-xl font-bold text-gray-900">{member.full_name}</h2>
            <p className="text-sm text-gray-500 font-medium">{member.position}</p>
            {member.years_of_experience && (
              <p className="text-xs text-gray-400 mt-0.5">{member.years_of_experience} years of experience</p>
            )}
          </div>
        </div>

        {member.bio && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">About</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          {member.qualifications && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Qualifications</p>
              <p className="text-sm text-gray-700">{member.qualifications}</p>
            </div>
          )}
          {member.specialization && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Specialization</p>
              <p className="text-sm text-gray-700">{member.specialization}</p>
            </div>
          )}
        </div>

        {(member.email || member.phone || member.linkedin_url || member.facebook_url) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                <Mail className="w-3.5 h-3.5" /> {member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                <Phone className="w-3.5 h-3.5" /> {member.phone}
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {member.facebook_url && (
              <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
                <Facebook className="w-3.5 h-3.5" /> Facebook
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: members = [] } = useQuery({
    queryKey: ["team-members-public"],
    queryFn: () => base44.entities.TeamMember.filter({ is_published: true }, "sort_order", 100),
    staleTime: 2 * 60 * 1000,
  });

  const departments = ["All", ...Array.from(new Set(members.filter(m => m.department).map(m => m.department)))];

  const featured = members.filter(m => m.is_featured);
  const filtered = activeFilter === "All"
    ? members
    : members.filter(m => m.department === activeFilter);

  if (members.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Our People</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-3">Our Team</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mt-3 leading-relaxed">
            Meet the dedicated professionals committed to nurturing excellence, character, and growth in every child.
          </p>
        </div>

        {/* Featured spotlight */}
        {featured.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Leadership Spotlight</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(m => <TeamCard key={m.id} member={m} onClick={setSelectedMember} />)}
            </div>
            {filtered.filter(m => !m.is_featured).length > 0 && (
              <div className="border-t border-gray-200 mt-12 mb-10" />
            )}
          </div>
        )}

        {/* Department filter */}
        {departments.length > 2 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {departments.map(dep => (
              <button
                key={dep}
                onClick={() => setActiveFilter(dep)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === dep
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {dep}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered
            .filter(m => featured.length > 0 && activeFilter === "All" ? !m.is_featured : true)
            .map(m => <TeamCard key={m.id} member={m} onClick={setSelectedMember} />)}
        </div>
      </div>

      <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
    </section>
  );
}