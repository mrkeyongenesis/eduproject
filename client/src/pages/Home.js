import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Find Your Match',
      description: 'Browse through verified profiles and find someone special near you.'
    },
    {
      icon: CalendarIcon,
      title: 'Easy Scheduling',
      description: 'Book dates directly through our calendar system with real-time availability.'
    },
    {
      icon: CreditCardIcon,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing through Stripe with full refund protection.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Profiles',
      description: 'All users are verified to ensure authentic and safe dating experiences.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'Found my perfect match within a week! The platform is so easy to use and the people are genuine.'
    },
    {
      name: 'Mike Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'Love the calendar booking system. No more back-and-forth texting to plan dates!'
    },
    {
      name: 'Emily Rodriguez',
      location: 'Austin, TX',
      rating: 5,
      text: 'The verification process gave me confidence that I was meeting real people. Highly recommend!'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Love,{' '}
              <span className="text-primary-600">Book Dates</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The modern way to meet someone special. Browse verified profiles, 
              check availability, and book your perfect date - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3"
              >
                Start Dating Today
              </Link>
              <Link
                to="/browse"
                className="btn-secondary text-lg px-8 py-3"
              >
                Browse Profiles
              </Link>
            </div>
          </div>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">10,000+ Active Users</h3>
              <p className="text-gray-600 text-sm">Join our growing community</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">5,000+ Dates Booked</h3>
              <p className="text-gray-600 text-sm">Successful connections made</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4.9/5 Rating</h3>
              <p className="text-gray-600 text-sm">Highly rated by users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, safe, and secure way to meet new people and book memorable dates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Create Your Profile
              </h3>
              <p className="text-gray-600">
                Set up your profile with photos, preferences, and availability. 
                Set your date price and let others know when you're free.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Browse & Book
              </h3>
              <p className="text-gray-600">
                Browse through verified profiles, check their availability, 
                and book a date that works for both of you.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Meet & Connect
              </h3>
              <p className="text-gray-600">
                Meet up for your date, have a great time, and leave reviews 
                to help others in the community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of singles who have found love through our platform.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HeartIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">LoveConnect</span>
            </div>
            <p className="text-gray-400">
              © 2024 LoveConnect. All rights reserved. Made with ❤️ for finding love.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;