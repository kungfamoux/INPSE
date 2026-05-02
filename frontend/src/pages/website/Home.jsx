import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Users, Award, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80"
            alt="School"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              International Nursery and
              <span className="text-orange-400"> Primary School Enugu</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Providing quality education with modern facilities and experienced teachers for your child's bright future since 1985.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/Admissions">
                <Button size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-base">
                  Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/Contact">
                <Button size="lg" className="rounded-full bg-white/15 border border-white text-white hover:bg-white hover:text-gray-900 px-8 h-12 text-base">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Why Choose Our School</h2>
            <p className="text-gray-600 mt-4">We provide the best learning environment for your child</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Education</h3>
              <p className="text-gray-600">Experienced teachers and modern curriculum</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Small Classes</h3>
              <p className="text-gray-600">Personalized attention for every student</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellent Results</h3>
              <p className="text-gray-600">Consistent academic performance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Facilities</h3>
              <p className="text-gray-600">Well-equipped classrooms and labs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to Enroll Your Child?</h2>
          <p className="text-lg text-gray-600 mb-8">Join our community of learners and give your child the best education.</p>
          <Link to="/Admissions">
            <Button size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-base">
              Start Application <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
