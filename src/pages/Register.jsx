import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CollegeDataService from '../services/CollegeDataService';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    emailPrefix: '',
    email: '',
    college: '',
    department: '',
    batch: '',
    gender: 'female',
    profile_pic_type: 6,
    selectedProfileImage: 6,
    profilePicUrl: null
  });
  const [colleges, setColleges] = useState([]);
  const [collegeData, setCollegeData] = useState({ departments: [], batches: [], emailSuffix: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [emailPrefixError, setEmailPrefixError] = useState('');
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  
  const { registerUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.username && user.college) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const collegeList = await CollegeDataService.loadColleges();
        setColleges(collegeList);
      } catch (error) {
        console.error('Error loading colleges:', error);
        toast.error('Failed to load college data. Please refresh the page.');
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

  const handleInputChange = async (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.college) {
      toast.error('Please select your college');
      return;
    }

    // Skip validation for "No Organization" users
    if (formData.college !== 'No Organization') {
      // Email validation based on college configuration
      if (collegeData.emailSuffix) {
        // College has ends_with - validate email prefix
        if (!formData.emailPrefix.trim()) {
          toast.error('Please enter your email prefix');
          return;
        }
        if (emailPrefixError) {
          toast.error('Please fix email format errors');
          return;
        }
      } else {
        // College doesn't have ends_with - validate full email
        if (!formData.email.trim()) {
          toast.error('Please enter your email address');
          return;
        }
      }

      if (!formData.department) {
        toast.error('Please select your department');
        return;
      }

      if (!formData.batch) {
        toast.error('Please select your batch year');
        return;
      }
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
        gender: formData.gender,
        profile_pic_type: formData.profile_pic_type,
        selectedProfileImage: formData.selectedProfileImage,
        profilePicUrl: null,
        total_request: {
          practice_mode: 0,
          test_mode: 0
        }
      };

      const result = await registerUser(userData);

      if (result.success) {
        toast.success('Registration successful! Welcome to SkillBench!');
        navigate('/', { replace: true });
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeSelect = (college) => {
    setFormData(prev => ({ ...prev, college, department: '', batch: '', email: '', emailPrefix: '' }));
    setIsCollegeOpen(false);
    // Trigger college data loading
    const syntheticEvent = { target: { name: 'college', value: college } };
    handleInputChange(syntheticEvent);
  };

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({ ...prev, department }));
    setIsDepartmentOpen(false);
  };

  const handleBatchSelect = (batch) => {
    setFormData(prev => ({ ...prev, batch }));
    setIsBatchOpen(false);
  };

  const profilePictureOptions = [
    { value: 6, label: 'Female', image: '/src/assets/profile_page/profile_images/profile_3.png' },
    { value: 7, label: 'Male', image: '/src/assets/profile_page/profile_images/profile_2.png' }
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
          whileHover={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            transition: { duration: 0.3 }
          }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#2E0059] via-[#4B007D] to-[#602769] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
            >
              <User className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Complete Your Profile
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Tell us a bit about yourself to get started
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <motion.input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your full name"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Profile Picture *
              </label>
              <div className="flex justify-center gap-8">
                {profilePictureOptions.map((option, index) => (
                  <motion.label
                    key={option.value}
                    className="relative flex flex-col items-center cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="radio"
                      name="selectedProfileImage"
                      value={option.value}
                      checked={formData.selectedProfileImage === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <motion.div
                      className={`w-16 h-16 rounded-full overflow-hidden mb-2 transition-all ${
                        formData.selectedProfileImage === option.value
                          ? 'ring-4 ring-purple-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-purple-300 hover:ring-offset-1'
                      }`}
                      animate={formData.selectedProfileImage === option.value ? {
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.3 }
                      } : {}}
                    >
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200" style={{display: 'none'}}>
                        {option.value === 6 ? '👩' : '👨'}
                      </div>
                    </motion.div>
                    <motion.span
                      className={`text-sm font-medium transition-colors ${
                        formData.selectedProfileImage === option.value
                          ? 'text-purple-600'
                          : 'text-gray-700'
                      }`}
                      animate={formData.selectedProfileImage === option.value ? {
                        scale: [1, 1.05, 1],
                        transition: { duration: 0.2 }
                      } : {}}
                    >
                      {option.label}
                    </motion.span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College * ({colleges.length} available)
              </label>
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => !dataLoading && setIsCollegeOpen(!isCollegeOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl hover:border-purple-400/50 hover:bg-white/70 transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={dataLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className={`text-left ${formData.college ? 'text-gray-900' : 'text-gray-500'}`}>
                    {dataLoading ? 'Loading colleges...' : (formData.college || 'Select your college')}
                  </span>
                  <motion.div
                    animate={{ rotate: isCollegeOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isCollegeOpen && !dataLoading && colleges.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.3 }}
                    >
                      {colleges.map((college, index) => (
                        <motion.button
                          key={college}
                          type="button"
                          onClick={() => handleCollegeSelect(college)}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 transition-all duration-300 border-b border-gray-100/50 last:border-b-0 group relative overflow-hidden"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
                          whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                          <span className="relative z-10 text-gray-700 group-hover:text-purple-600 font-medium transition-colors duration-200">
                            {college}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {colleges.length === 0 && !dataLoading && (
                <p className="text-sm text-red-600 mt-1">No colleges loaded from database</p>
              )}
            </motion.div>

            {formData.college !== 'No Organization' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.13, duration: 0.3 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                {collegeData.emailSuffix ? (
                  // Split field for colleges with ends_with
                  <div className="space-y-2">
                    <div className="flex">
                      <motion.input
                        id="emailPrefix"
                        name="emailPrefix"
                        type="text"
                        value={formData.emailPrefix}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter email prefix"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      />
                      <div className="px-4 py-3 bg-gray-100/70 backdrop-blur-sm border border-l-0 border-gray-300 rounded-r-xl text-gray-600 flex items-center">
                        {collegeData.emailSuffix}
                      </div>
                    </div>
                    {emailPrefixError && (
                      <motion.p
                        className="text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {emailPrefixError}
                      </motion.p>
                    )}
                    {formData.email && (
                      <motion.p
                        className="text-sm text-gray-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Preview: <span className="font-medium text-purple-600">{formData.email}</span>
                      </motion.p>
                    )}
                  </div>
                ) : (
                  // Normal email input for colleges without ends_with
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email address"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => {
                    const isEnabled = formData.college && formData.college !== 'No Organization' && collegeData.departments.length > 0;
                    if (isEnabled) setIsDepartmentOpen(!isDepartmentOpen);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 ${
                    !formData.college || formData.college === 'No Organization' || collegeData.departments.length === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white/50 backdrop-blur-sm hover:border-purple-400/50 hover:bg-white/70 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer'
                  }`}
                  disabled={!formData.college || formData.college === 'No Organization' || collegeData.departments.length === 0}
                  whileHover={formData.college && formData.college !== 'No Organization' && collegeData.departments.length > 0 ? { scale: 1.01 } : {}}
                  whileTap={formData.college && formData.college !== 'No Organization' && collegeData.departments.length > 0 ? { scale: 0.99 } : {}}
                >
                  <span className="text-left">
                    {!formData.college ? "Select college first" :
                     formData.college === 'No Organization' ? "Not required for No Organization" :
                     collegeData.departments.length === 0 ? "No departments available" :
                     (formData.department || "Select your department")}
                  </span>
                  <motion.div
                    animate={{
                      rotate: isDepartmentOpen ? 180 : 0,
                      opacity: (!formData.college || formData.college === 'No Organization' || collegeData.departments.length === 0) ? 0.3 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDepartmentOpen && formData.college && formData.college !== 'No Organization' && collegeData.departments.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.3 }}
                    >
                      {collegeData.departments.map((department, index) => (
                        <motion.button
                          key={department}
                          type="button"
                          onClick={() => handleDepartmentSelect(department)}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 transition-all duration-300 border-b border-gray-100/50 last:border-b-0 group relative overflow-hidden"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
                          whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                          <span className="relative z-10 text-gray-700 group-hover:text-purple-600 font-medium transition-colors duration-200">
                            {department}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Year *
              </label>
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => {
                    const isEnabled = formData.college && formData.college !== 'No Organization' && collegeData.batches.length > 0;
                    if (isEnabled) setIsBatchOpen(!isBatchOpen);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl transition-all duration-300 ${
                    !formData.college || formData.college === 'No Organization' || collegeData.batches.length === 0
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-white/50 backdrop-blur-sm hover:border-purple-400/50 hover:bg-white/70 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer'
                  }`}
                  disabled={!formData.college || formData.college === 'No Organization' || collegeData.batches.length === 0}
                  whileHover={formData.college && formData.college !== 'No Organization' && collegeData.batches.length > 0 ? { scale: 1.01 } : {}}
                  whileTap={formData.college && formData.college !== 'No Organization' && collegeData.batches.length > 0 ? { scale: 0.99 } : {}}
                >
                  <span className="text-left">
                    {!formData.college ? "Select college first" :
                     formData.college === 'No Organization' ? "Not required for No Organization" :
                     collegeData.batches.length === 0 ? "No batches available" :
                     (formData.batch || "Select your batch year")}
                  </span>
                  <motion.div
                    animate={{
                      rotate: isBatchOpen ? 180 : 0,
                      opacity: (!formData.college || formData.college === 'No Organization' || collegeData.batches.length === 0) ? 0.3 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isBatchOpen && formData.college && formData.college !== 'No Organization' && collegeData.batches.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.3 }}
                    >
                      {collegeData.batches.map((batch, index) => (
                        <motion.button
                          key={batch}
                          type="button"
                          onClick={() => handleBatchSelect(batch)}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 transition-all duration-300 border-b border-gray-100/50 last:border-b-0 group relative overflow-hidden"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
                          whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                          <span className="relative z-10 text-gray-700 group-hover:text-purple-600 font-medium transition-colors duration-200">
                            {batch}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>


            {dataLoading && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading colleges...</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2E0059] via-[#4B007D] to-[#602769] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              {loading ? (
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          >
            <p className="text-xs text-gray-500">
              By registering, you agree to our terms of service and privacy policy
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;