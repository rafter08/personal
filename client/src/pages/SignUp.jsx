"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, [location.search]);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await axios.post("https://personal-jpgy.onrender.com/api/auth/register", formData);
        localStorage.setItem("token", response.data.token);
        toast.success("Registered successfully! Redirecting to login...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } catch (error) {
        if (error.response && error.response.data) {
          setErrors({ ...errors, server: error.response.data.message });
        } else {
          setErrors({ ...errors, server: "Something went wrong. Please try again." });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-white bg-gray-800 p-2 rounded-md z-50 sm:top-6 sm:left-6"
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Previous</span>
      </button>
      <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold">InvestDaily</h1>
        <p className="mt-4 text-lg text-gray-400">Your trusted investment platform</p>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-16 bg-gray-900 md:bg-gray-100 relative">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white md:text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-400 md:text-gray-600">
            Or{" "}
            <Link to="/signin" className="font-medium text-indigo-500 hover:text-indigo-400">
              sign in to your account
            </Link>
          </p>
        </div>
        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 md:bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-xl sm:rounded-2xl">
            {errors.server && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">{errors.server}</div>
            )}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Name
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${errors.name ? "bg-red-50" : "bg-gray-700 md:bg-white"
                      } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Email address
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${errors.email ? "bg-red-50" : "bg-gray-700 md:bg-white"
                      } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Password
                </label>
                <div className="mt-1 sm:mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner ${errors.password ? "bg-red-50" : "bg-gray-700 md:bg-white"
                      } text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition duration-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="referralCode" className="block text-xs sm:text-sm font-medium text-gray-300 md:text-gray-700">
                  Referral Code (Optional)
                </label>
                <div className="mt-1 sm:mt-2">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 sm:px-4 py-2 sm:py-3 border-0 rounded-lg shadow-inner bg-gray-700 md:bg-white text-white md:text-gray-900 placeholder-gray-500 md:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-xs sm:text-sm text-gray-400 md:text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-indigo-500 hover:text-indigo-400 underline"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.terms}</p>}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 sm:py-3 px-4 rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 text-sm sm:text-base"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showTerms && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-4">Terms and Conditions</h3>
            <div className="text-sm text-gray-500 space-y-2 sm:space-y-4">
              <p>1. By signing up on InvestDaily, you agree to abide by all the terms stated in this document. These terms govern your use of our services, website, and all transactions conducted.</p>
              <p>2. You must be at least 18 years old to use InvestDaily. By accessing the platform, you confirm that you meet the minimum age requirement.</p>
              <p>3. All investments involve risk, including the loss of principal. Historical returns do not guarantee future performance or earnings.</p>
              <p>4. You are responsible for safeguarding your login credentials and any activity that occurs under your account. Sharing login details is strictly prohibited.</p>
              <p>5. InvestDaily reserves the right to suspend, restrict, or terminate accounts that engage in suspicious, fraudulent, or prohibited activities.</p>
              <p>6. Payments are securely processed using industry-standard encryption and trusted third-party payment providers. We do not store any sensitive payment details.</p>
              <p>7. Withdrawal requests must comply with our official withdrawal policy. Processing time may vary based on plan type and user verification status.</p>
              <p>8. Our referral program is governed by a separate set of terms. Abuse or manipulation of the program will lead to immediate disqualification and potential suspension.</p>
              <p>9. Daily returns are calculated based on plan structure and credited to your wallet accordingly. Timing of credit may vary depending on server load and market activity.</p>
              <p>10. We may update these terms periodically, with or without prior notice. Your continued use of the platform signifies your agreement to any such changes.</p>
              <p>11. It is your responsibility to read and understand all plan details before making an investment. Plan structures are final once activated.</p>
              <p>12. InvestDaily does not provide financial or tax advice. Please consult with a licensed professional before making financial decisions.</p>
              <p>13. Investments become active only after payment has been confirmed. If payment fails or is canceled, the investment will not be processed.</p>
              <p>14. You must use your own identity and accurate personal details during registration. Fake or duplicate accounts will be terminated.</p>
              <p>15. The platform prohibits the use of automated bots, scripts, or unauthorized software. Any such activity will be grounds for immediate termination.</p>
              <p>16. Multiple accounts per individual or IP address are not allowed unless specifically approved by our support team.</p>
              <p>17. InvestDaily is not responsible for losses incurred due to internet outages, technical glitches, or disruptions in service.</p>
              <p>18. We reserve the right to change or discontinue any investment plan at any time without notice. Existing plans will continue as scheduled.</p>
              <p>19. Promotional bonuses may be offered occasionally. Terms for bonuses will be clearly communicated and must be fulfilled before withdrawal.</p>
              <p>20. Withdrawal requests can be made only from verified wallets. Unverified or suspicious wallets may be blocked.</p>
              <p>21. InvestDaily may request Know Your Customer (KYC) documentation for identity verification. Delays in submission may affect access.</p>
              <p>22. We reserve the right to freeze or restrict withdrawals on accounts with flagged activity until investigations are complete.</p>
              <p>23. Taxation is the sole responsibility of the investor. InvestDaily does not deduct or report user taxes to local authorities.</p>
              <p>24. You may contact our support team for any concerns or disputes. Response times may vary depending on ticket volume.</p>
              <p>25. Communication from InvestDaily will primarily occur through email or platform notifications. Users must ensure they have access to these channels.</p>
              <p>26. All transactions on the platform are final. Refunds or reversals are not allowed unless initiated due to system error.</p>
              <p>27. Returns are not guaranteed and depend on market performance and internal fund management. Users must acknowledge this risk.</p>
              <p>28. Platform outages may delay earnings credit, but we will make every effort to resume normal operations promptly.</p>
              <p>29. Attempts to hack, alter, or gain unauthorized access to platform infrastructure will be legally prosecuted.</p>
              <p>30. Users must ensure that bank account details provided for withdrawals are accurate and up-to-date. Errors may lead to payment failures.</p>
              <p>31. Only bank accounts under the registered user’s name will be accepted for withdrawals. Third-party transfers are not allowed.</p>
              <p>32. Interest rates, plan durations, and bonuses may change over time. You will be notified in case of significant changes.</p>
              <p>33. You must log in periodically to remain an active user. Dormant accounts may be subject to archival or deactivation.</p>
              <p>34. Customer service representatives will never ask for your password or sensitive payment information. Be alert to potential scams.</p>
              <p>35. Data collected is used only for operational and legal purposes. We do not sell user data to third parties.</p>
              <p>36. Users found engaging in misleading advertising or promoting unrealistic returns will be banned from the platform.</p>
              <p>37. You must not use InvestDaily to launder money or engage in any form of financial crime. We cooperate with legal authorities if needed.</p>
              <p>38. Plans must be selected carefully. Once funds are invested, plan changes or cancellations are not permitted.</p>
              <p>39. User reviews and testimonials must reflect genuine experiences. Fabricated reviews will be removed, and accounts penalized.</p>
              <p>40. InvestDaily operates based on profit realization. Daily returns will be issued only if we generate profits, and in the absence of profits, we are not responsible for returning your principal investment.</p>
              <p>41. By investing, you acknowledge that returns are variable and dependent on real-time investment performance.</p>
              <p>42. You should not invest funds that you cannot afford to lose. Always invest cautiously and within your means.</p>
              <p>43. Plans with fixed durations cannot be exited prematurely. Returns are credited only at the end or as per schedule.</p>
              <p>44. Complaints regarding missed payouts must be raised within 48 hours. Delays beyond this window may not be investigated.</p>
              <p>45. All activity on the platform is logged and subject to audit to ensure compliance and security.</p>
              <p>46. You agree not to disparage InvestDaily publicly or on social media. Negative campaigns without cause may lead to suspension.</p>
              <p>47. For any legal disputes, the jurisdiction will be as per our registered country of operation.</p>
              <p>48. We may offer loyalty rewards for long-term users. Such rewards are discretionary and non-binding.</p>
              <p>49. Platform designs, content, and intellectual property are owned by InvestDaily. Unauthorized usage is prohibited.</p>
              <p>50. User feedback is welcome and helps us improve. However, suggestions are non-compensable unless agreed otherwise.</p>
              <p>51. We may conduct routine maintenance, during which platform access may be temporarily restricted. Users will be notified in advance whenever possible.</p>
              <p>52. You are encouraged to use strong passwords and enable any available security features. Account security is a shared responsibility.</p>
              <p>53. Inactive accounts with no login activity for more than 6 months may be deactivated. Reactivation can be requested via support.</p>
              <p>54. All financial activities are subject to applicable national and international regulations. Users are expected to comply accordingly.</p>
              <p>55. We do not guarantee any minimum rate of return. Returns may fluctuate based on market conditions and company profitability.</p>
              <p>56. Affiliate earnings are credited once the referred user invests and meets bonus eligibility criteria. False referrals will be disqualified.</p>
              <p>57. InvestDaily does not support investments made through third-party wallets or unknown sources. All deposits must be from registered accounts.</p>
              <p>58. Users must avoid posting misleading or exaggerated income claims related to InvestDaily on social platforms or public forums.</p>
              <p>59. Platform analytics and performance dashboards are for informational purposes only. They do not reflect guaranteed returns.</p>
              <p>60. Any promotional content or media created using InvestDaily branding must be pre-approved by our team to ensure consistency and legality.</p>
              <p>61. In the event of any suspicious login activity, we may temporarily lock your account for safety. You’ll be required to complete verification.</p>
              <p>62. Email updates and newsletters may be sent periodically. You can opt out of non-essential communication anytime from your settings.</p>
              <p>63. Daily crediting of returns may occasionally be delayed due to banking holidays, server updates, or technical reasons.</p>
              <p>64. Funds from different plans cannot be merged or reallocated unless explicitly stated by our support team during promotions or changes.</p>
              <p>65. Our platform is continuously evolving. We may introduce new features, remove old ones, or restructure plans as needed.</p>
              <p>66. Investors are advised to monitor their dashboards regularly and keep records of their transactions for transparency.</p>
              <p>67. Our customer support may reach out to verify large transactions. Failure to respond may delay processing of those transactions.</p>
              <p>68. You agree not to host, upload, or distribute viruses or malicious code via the platform. Such behavior will be prosecuted.</p>
              <p>69. In the event of a data breach, we will notify users within a reasonable timeframe and take necessary mitigation steps immediately.</p>
              <p>70. If a plan is discontinued, active users on that plan will continue to receive payouts until the originally agreed duration ends.</p>
              <p>71. Plan purchases made using promotional offers are non-refundable and subject to additional eligibility checks.</p>
              <p>72. Users must maintain decorum when interacting with our support team. Abusive language or threats will not be tolerated.</p>
              <p>73. InvestDaily operates under strict anti-money laundering (AML) policies. Any account found violating them will be reported and blocked.</p>
              <p>74. Platform uptime is typically 99%, but occasional downtime due to upgrades or infrastructure issues may occur.</p>
              <p>75. If you forget your password, you can reset it via the registered email address. We do not support recovery via phone or other means.</p>
              <p>76. InvestDaily reserves the right to withhold withdrawals temporarily in the event of market instability or financial emergencies.</p>
              <p>77. The earnings dashboard reflects accumulated earnings but may take time to update in real time during peak server activity.</p>
              <p>78. You may not impersonate any person or entity, including an InvestDaily representative. Such actions are illegal and punishable.</p>
              <p>79. Any promotional contests or giveaways hosted by InvestDaily are subject to separate terms and eligibility rules.</p>
              <p>80. By investing in long-term plans, you acknowledge that early withdrawals are not allowed unless explicitly stated otherwise.</p>
              <p>81. We reserve the right to reverse mistakenly credited amounts from your wallet without notice if it was due to a technical error.</p>
              <p>82. You must not attempt to reverse engineer, duplicate, or exploit the platform's backend systems or architecture.</p>
              <p>83. All investment-related communication should occur via official InvestDaily channels. Do not trust third-party messages or links.</p>
              <p>84. Complaints raised on public forums without first contacting our support team may result in account review and possible suspension.</p>
              <p>85. Your account and earnings cannot be transferred or sold to another user. Accounts are non-transferable by design.</p>
              <p>86. Users engaging in pyramid or Ponzi-style promotions in the name of InvestDaily will be permanently banned and reported.</p>
              <p>87. You are solely responsible for reporting your earnings to tax authorities as per your jurisdiction’s tax laws.</p>
              <p>88. InvestDaily is not liable for any personal, emotional, or psychological losses arising due to financial outcomes.</p>
              <p>89. Emergency support is available for high-risk issues, but general queries must follow the standard support ticket process.</p>
              <p>90. Unauthorized advertisements or spam posted using our brand name may lead to blacklisting of your account and legal action.</p>
              <p>91. Users found creating groups or pages impersonating InvestDaily without permission will face legal and platform action.</p>
              <p>92. In case of disputes, our internal investigation team will analyze all logs and data before making a final decision.</p>
              <p>93. You may not use our platform to promote external investment services, tools, or platforms without written permission.</p>
              <p>94. Plan performance metrics and summaries are estimates and not contractual obligations. They may be revised or corrected.</p>
              <p>95. Rewards and bonuses issued are discretionary and may be withheld or adjusted in cases of system misuse or misreporting.</p>
              <p>96. We maintain logs of user activity for quality control and legal compliance. This data is kept confidential and secure.</p>
              <p>97. System downtime of under 24 hours does not qualify for compensation unless explicitly announced otherwise.</p>
              <p>98. While we aim for daily return crediting, unforeseen market events or emergencies may delay payouts without prior notice.</p>
              <p>99. Platform features may work differently depending on your region, device, or language settings. We recommend using a modern browser.</p>
              <p>100. You are responsible for maintaining updated bank and contact information to ensure uninterrupted transactions and support communication.</p>
              <p>101. If we detect multiple failed withdrawal attempts, your account may be flagged for review to ensure security.</p>
              <p>102. Promo codes or coupons shared on unofficial channels are not endorsed by us and may not work as intended.</p>
              <p>103. We may introduce new payment gateways or remove existing ones based on transaction performance and user feedback.</p>
              <p>104. Cashback offers are valid only if explicitly mentioned and will be credited only after validation of the investment.</p>
              <p>105. You may not use our platform to solicit, promote, or conduct illegal financial schemes or collect user data.</p>
              <p>106. Accounts left idle with balances for over one year may be archived. Archived balances may be forfeited if unclaimed.</p>
              <p>107. You may not manipulate your referrals or self-invite through different emails. Doing so will result in account bans.</p>
              <p>108. All referrals must be organic and follow the guidelines. Fake or incentivized signups violate our policy.</p>
              <p>109. We periodically review account activity for fairness. Accounts using unfair means may be suspended permanently.</p>
              <p>110. The interest rates shown on the plan pages are approximate and subject to change based on market or business factors.</p>
              <p>111. If you switch devices frequently or log in from multiple locations, we may temporarily lock your account for security checks.</p>
              <p>112. All transactions and balances are stored securely using encrypted protocols to prevent unauthorized access.</p>
              <p>113. Users are not permitted to copy or redistribute the plan logic, structure, or earnings flow in any format.</p>
              <p>114. Only one promotional offer may be applied per investment. Offers cannot be combined unless clearly mentioned.</p>
              <p>115. We may request verification calls for large withdrawals. Refusal to respond may lead to delays or rejections.</p>
              <p>116. Plan upgrades are not currently supported. You must complete one plan before purchasing another of a different tier.</p>
              <p>117. Referral commissions are calculated daily and credited weekly unless otherwise stated during promotions.</p>
              <p>118. You are not allowed to share screenshots of the backend system or admin panel without prior written consent.</p>
              <p>119. If any of your documents for KYC are found to be fraudulent, your account will be permanently blocked without notice.</p>
              <p>120. Our leadership team reserves the right to interpret or override any term or clause in special business scenarios.</p>
              <p>121. Users must not run paid ads using the InvestDaily brand or keywords unless authorized to do so in writing.</p>
              <p>122. You may request a transaction report for your account via email or download it from your dashboard, if available.</p>
              <p>123. Withdrawal limits may be enforced based on plan, verification status, or risk assessments for user protection.</p>
              <p>124. Any attempt to defame the company or spread false rumors will lead to immediate termination of your account and legal proceedings.</p>
              <p>125. We recommend users perform their due diligence and risk assessment before investing in any plan.</p>
              <p>126. We may use anonymized user data for analytics and product improvement without compromising user privacy.</p>
              <p>127. In the event of a platform shutdown, users will be notified via email and dashboard with instructions to withdraw remaining balances.</p>
              <p>128. You must not misuse bugs or loopholes in the platform. Any exploitation will result in reversal of earnings and a ban.</p>
              <p>129. If your account is compromised due to your negligence (e.g., sharing OTPs), InvestDaily will not be liable for resulting losses.</p>
              <p>130. During high demand or peak traffic, service delays may occur. We appreciate your patience during such times.</p>
              <p>131. Any attempt to bypass withdrawal fees or manipulate them is a violation of terms and will result in account actions.</p>
              <p>132. Communication regarding account bans or issues will only be made via official channels such as support mail or dashboard notifications.</p>
              <p>133. Our terms are governed under applicable financial, digital services, and cyber laws of the country in which we operate.</p>
              <p>134. Use of VPNs, proxies, or location spoofing tools may lead to access restrictions unless approved by our team for valid reasons.</p>
              <p>135. Support agents are available during working hours only. High-priority cases will be handled first, followed by general inquiries.</p>
              <p>136. InvestDaily is not liable for delayed earnings caused due to external dependencies like payment gateways or regulatory hold-ups.</p>
              <p>137. We reserve the right to amend referral bonuses, earnings caps, and plan limits to maintain platform sustainability.</p>
              <p>138. Your feedback may be used to improve the product experience. However, no obligation exists to implement all suggestions.</p>
              <p>139. By continuing to use our services after an update to these terms, you indicate your acceptance of the new conditions.</p>
              <p>140. In the event of death or incapacitation of a user, account access may be granted to next of kin upon legal verification.</p>
              <p>141. Repeated violations of minor policies will be treated cumulatively and may lead to long-term suspensions.</p>
              <p>142. Reward points or loyalty credits, if issued, must be redeemed within the validity period. Expired rewards will not be reissued.</p>
              <p>143. Platform features are optimized for latest browsers. Using outdated software may result in limited or broken functionality.</p>
              <p>144. Video tutorials, webinars, and learning material provided are for educational purposes only and not investment advice.</p>
              <p>145. All disputes should first be addressed to support. Legal escalation must be a last resort after internal resolution fails.</p>
              <p>146. You agree to provide truthful and accurate information during any surveys or audits requested by InvestDaily.</p>
              <p>147. If you encounter any bugs, glitches, or errors, report them to support. Exploiting them is against platform ethics.</p>
              <p>148. Our logos, branding assets, and communication templates are proprietary. Unauthorized use is a copyright violation.</p>
              <p>149. We do not permit resale of user data, investor details, or contact information under any condition.</p>
              <p>150. By using InvestDaily, you acknowledge that you are investing at your own risk and that daily returns are dependent on profit generation and market conditions, not guaranteed income.</p>

            </div>
            <div className="mt-4 sm:mt-6 flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowTerms(false)}
                className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default SignUp;
