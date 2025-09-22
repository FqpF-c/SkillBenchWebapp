import React, { useState, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CollegeDataService from '../../services/CollegeDataService';

const Registration = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    username: '',
    emailPrefix: '',
    email: '',
    college: '',
    department: '',
    batch: '',
    phone_number: '',
    gender: 'female', // derived from profile pic
    profile_pic_type: 0,
    selectedProfileImage: 0,
    profilePicUrl: null
  });
  const [colleges, setColleges] = useState([]);
  const [collegeData, setCollegeData] = useState({ departments: [], batches: [], emailSuffix: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailPrefixError, setEmailPrefixError] = useState('');
  const { registerUser } = useAuth();

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Handle profile picture selection and derive gender
    if (name === 'selectedProfileImage') {
      const profileImageInt = parseInt(value);
      let gender;
      switch (profileImageInt) {
        case 6: // Female
          gender = 'female';
          break;
        case 7: // Male
          gender = 'male';
          break;
        case 0: // Prefer Not to Say
        default:
          gender = 'prefer_not_to_say';
          break;
      }

      setFormData(prev => ({
        ...prev,
        selectedProfileImage: profileImageInt,
        profile_pic_type: profileImageInt,
        gender: gender
      }));
      return;
    }

    // Handle email prefix validation and generation (for colleges with ends_with)
    if (name === 'emailPrefix') {
      setEmailPrefixError('');

      if (value && !CollegeDataService.validateEmailPrefix(value)) {
        setEmailPrefixError('Only alphanumeric characters, dots, and underscores allowed');
      }

      const orgEmail = collegeData.emailSuffix ?
        CollegeDataService.generateOrganizationEmail(value, collegeData.emailSuffix) : '';

      setFormData(prev => ({
        ...prev,
        emailPrefix: value,
        email: orgEmail
      }));
      return;
    }

    // Handle direct email input (for colleges without ends_with)
    if (name === 'email' && !collegeData.emailSuffix) {
      setFormData(prev => ({
        ...prev,
        email: value,
        emailPrefix: '' // Clear prefix when using direct email
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });

    // Load college-specific data when college is selected
    if (name === 'college' && value) {
      try {
        const data = await CollegeDataService.loadCollegeData(value);
        setCollegeData(data);

        // Reset department, batch, and email when college changes
        setFormData(prev => ({
          ...prev,
          college: value,
          department: '',
          batch: '',
          email: '',
          emailPrefix: ''
        }));
      } catch (error) {
        console.error('Error loading college data:', error);
      }
    }
  };

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const collegeList = await CollegeDataService.loadColleges();
        setColleges(collegeList);
      } catch (error) {
        console.error('Error loading colleges:', error);
        setError('Failed to load college data. Please refresh the page.');
      } finally {
        setDataLoading(false);
      }
    };

    loadColleges();
  }, []);

  useEffect(() => {
    // Generate organization email when email prefix and college are both available
    if (formData.emailPrefix.trim() && formData.college && collegeData.emailSuffix) {
      const orgEmail = CollegeDataService.generateOrganizationEmail(formData.emailPrefix, collegeData.emailSuffix);
      setFormData(prev => ({
        ...prev,
        email: orgEmail
      }));
    }
  }, [formData.emailPrefix, formData.college, collegeData.emailSuffix]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.college) {
      setError('Please select your college');
      return;
    }

    // Skip validation for "No Organization" users
    if (formData.college !== 'No Organization') {
      // Email validation based on college configuration
      if (collegeData.emailSuffix) {
        // College has ends_with - validate email prefix
        if (!formData.emailPrefix.trim()) {
          setError('Please enter your email prefix');
          return;
        }
        if (emailPrefixError) {
          setError('Please fix email format errors');
          return;
        }
      } else {
        // College doesn't have ends_with - validate full email
        if (!formData.email.trim()) {
          setError('Please enter your email address');
          return;
        }
      }

      if (!formData.department) {
        setError('Please select your department');
        return;
      }

      if (!formData.batch) {
        setError('Please select your batch year');
        return;
      }
    }

    if (!formData.phone_number.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      // Structure data to match Flutter format
      const userData = {
        username: formData.username,
        college: formData.college === 'No Organization' ? null : formData.college,
        email: formData.college === 'No Organization' ? null : formData.email,
        department: formData.college === 'No Organization' ? null : formData.department,
        batch: formData.college === 'No Organization' ? null : formData.batch,
        phone_number: formData.phone_number,
        gender: formData.gender,
        profile_pic_type: formData.profile_pic_type,
        selectedProfileImage: formData.selectedProfileImage,
        profilePicUrl: null,
        total_request: {
          practice_mode: 0,
          test_mode: 0
        }
      };

      const result = await registerUser(userData);\n\n      if (result.success) {\n        onComplete();\n      } else {\n        setError(result.error || 'Registration failed');\n      }\n    } catch (error) {\n      setError('Something went wrong. Please try again.');\n    } finally {\n      setLoading(false);\n    }\n  };"}, {"old_string": "        total_request: {\n          practice_mode: 0,\n          test_mode: 0\n        }\n      };\n\n      const result = await registerUser(userData);\n\n      if (result.success) {\n        onComplete();\n      } else {\n        setError(result.error || 'Registration failed');\n      }\n    } catch (error) {\n      setError('Something went wrong. Please try again.');\n    } finally {\n      setLoading(false);\n    }\n  };", "new_string": "        total_request: {\n          practice_mode: 0,\n          test_mode: 0\n        }\n      };\n\n      const result = await registerUser(userData);\n\n      if (result.success) {\n        onComplete();\n      } else {\n        setError(result.error || 'Registration failed');\n      }\n    } catch (error) {\n      setError('Something went wrong. Please try again.');\n    } finally {\n      setLoading(false);\n    }\n  };"}]

  const profilePictureOptions = [
    { value: 6, label: 'Female', image: '/images/profile_6.png' },
    { value: 7, label: 'Male', image: '/images/profile_7.png' },
    { value: 0, label: 'Prefer Not to Say', image: '/images/profile_0.png' }
  ];

  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {formData.college !== 'No Organization' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                {collegeData.emailSuffix ? (
                  // Split field for colleges with ends_with
                  <div className="space-y-2">
                    <div className="flex">
                      <input
                        id="emailPrefix"
                        name="emailPrefix"
                        type="text"
                        value={formData.emailPrefix}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter email prefix"
                      />
                      <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-xl text-gray-600 flex items-center">
                        {collegeData.emailSuffix}
                      </div>
                    </div>
                    {emailPrefixError && (
                      <p className="text-sm text-red-600">{emailPrefixError}</p>
                    )}
                    {formData.email && (
                      <p className="text-sm text-gray-600">
                        Preview: <span className="font-medium">{formData.email}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  // Normal email input for colleges without ends_with
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {profilePictureOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.selectedProfileImage === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedProfileImage"
                      value={option.value}
                      checked={formData.selectedProfileImage === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 bg-gray-200">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-2xl" style={{display: 'none'}}>
                        {option.value === 6 ? '👩' : option.value === 7 ? '👨' : '🧑'}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {option.label}
                    </span>
                    {formData.selectedProfileImage === option.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-2">
                College * ({colleges.length} available)
              </label>
              <div className="relative">
                <select
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 cursor-pointer"
                  disabled={dataLoading}
                  style={{ appearance: 'none' }}
                >
                  <option value="" disabled>
                    {dataLoading ? "Loading colleges..." : "▼ Select your college"}
                  </option>
                  {colleges.length > 0 ? colleges.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  )) : (
                    <option value="" disabled>No colleges available</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
              {colleges.length === 0 && !dataLoading && (
                <p className="text-sm text-red-600 mt-1">No colleges loaded from database</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none ${
                    !formData.college || formData.college === 'No Organization' || collegeData.departments.length === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white'
                  }`}
                  disabled={!formData.college || formData.college === 'No Organization' || collegeData.departments.length === 0}
                >
                  <option value="">
                    {!formData.college ? "Select college first" :
                     formData.college === 'No Organization' ? "Not required for No Organization" :
                     collegeData.departments.length === 0 ? "No departments available" :
                     "Select your department"}
                  </option>
                  {collegeData.departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-2">
                Batch Year *
              </label>
              <div className="relative">
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none ${
                    !formData.college || formData.college === 'No Organization' || collegeData.batches.length === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white'
                  }`}
                  disabled={!formData.college || formData.college === 'No Organization' || collegeData.batches.length === 0}
                >
                  <option value="">
                    {!formData.college ? "Select college first" :
                     formData.college === 'No Organization' ? "Not required for No Organization" :
                     collegeData.batches.length === 0 ? "No batches available" :
                     "Select your batch year"}
                  </option>
                  {collegeData.batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {dataLoading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading colleges...</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || dataLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;