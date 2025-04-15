import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      {/* Hero Section (Modified for mobile and desktop) */}
      <div className="relative pt-12 sm:pt-16 pb-16 sm:pb-32 flex items-center justify-center min-h-screen bg-black">
        <div className="container relative mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center">
            <div className="w-full px-4 text-center max-w-xs sm:max-w-sm md:max-w-md lg:w-6/12">
              <div className="pr-0 sm:pr-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mt-0 mb-4 text-white">
                  Invest Daily, Earn Consistently
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-300">
                  Join thousands of investors who are growing their wealth with our daily investment plans. Start small,
                  earn big, and withdraw on your terms.
                </p>
                <div className="mt-6 sm:mt-10">
                  <Link
                    to="/plans"
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg inline-flex items-center transition duration-300"
                  >
                    Explore Plans <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-4/12 px-4 text-center mb-8 md:mb-0">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-900 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h6 className="text-xl font-semibold">Daily Returns</h6>
                  <p className="mt-2 mb-4 text-gray-400">
                    Earn fixed daily returns based on your investment plan. Watch your money grow day by day.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center mb-8 md:mb-0">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-900 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <h6 className="text-xl font-semibold">Regular Withdrawals</h6>
                  <p className="mt-2 mb-4 text-gray-400">
                    Withdraw your earnings every 3 days. Flexible and reliable access to your profits.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-900 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h6 className="text-xl font-semibold">Referral Bonuses</h6>
                  <p className="mt-2 mb-4 text-gray-400">
                    Earn ₹200 for each friend you refer who joins and invests. Grow your network, grow your wealth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center text-center mb-16">
            <div className="w-full lg:w-6/12 px-4">
              <h2 className="text-4xl font-semibold">What Our Investors Say</h2>
              <p className="text-lg leading-relaxed m-4 text-gray-400">
                Don't just take our word for it. Here's what our community has to say about their experience.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full md:w-4/12 px-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 mb-4">
                  "I've been using this platform for 3 months now and I'm amazed at how consistent the returns are. The
                  daily income has helped me pay off my debts."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <div className="ml-3">
                    <h6 className="text-white font-semibold">Rahul S.</h6>
                    <p className="text-gray-500 text-sm">Plan 3 Investor</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-4/12 px-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 mb-4">
                  "The referral program is amazing! I've earned over ₹2000 just by referring my friends. The platform is
                  user-friendly and withdrawals are always on time."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    PK
                  </div>
                  <div className="ml-3">
                    <h6 className="text-white font-semibold">Priya K.</h6>
                    <p className="text-gray-500 text-sm">Plan 2 Investor</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-4/12 px-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 mb-4">
                  "I started with Plan 1 and gradually upgraded to Plan 4. The daily returns have been consistent and
                  the withdrawal process is smooth. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    AJ
                  </div>
                  <div className="ml-3">
                    <h6 className="text-white font-semibold">Amit J.</h6>
                    <p className="text-gray-500 text-sm">Plan 4 Investor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-8/12 px-4 mr-auto ml-auto text-center">
              <h3 className="text-3xl font-semibold text-white">Ready to start earning daily?</h3>
              <p className="text-lg text-white opacity-80 mt-4 mb-8">
                Join our community of investors and start earning daily returns on your investments.
              </p>
              <Link
                to="/plans"
                className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                View Investment Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
