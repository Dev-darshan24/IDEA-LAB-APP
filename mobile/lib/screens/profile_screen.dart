import 'package:flutter/material.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoggedIn = false;
  bool _isLoginTab = true; // true = Login, false = Register
  int _registerStep = 1; // 1 = Details Form, 2 = OTP Verification
  String _userRole = 'user'; // 'user', 'superadmin_1', 'superadmin_2'

  // Login Controllers
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  // Profile / Register Controllers
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _collegeIdController = TextEditingController();
  final _registerPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // OTP Controllers
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  String _currentEducation = 'B.Tech';

  // Registered Accounts Registry (SuperAdmins pre-configured + user registrations)
  final Map<String, Map<String, String>> _registeredAccounts = {
    'incharge@tgpcet.ac.in': {
      'first_name': 'Dr. Neeraj',
      'middle_name': '',
      'last_name': 'Waijode',
      'email': 'incharge@tgpcet.ac.in',
      'phone': '+91 9876543210',
      'password': 'demo123',
      'college_id': 'FAC-IDEA-01',
      'education': 'Other',
      'role': 'superadmin_1',
    },
    'darshan@tgpcet.ac.in': {
      'first_name': 'Darshan',
      'middle_name': 'R.',
      'last_name': 'Developer',
      'email': 'darshan@tgpcet.ac.in',
      'phone': '+91 9123456789',
      'password': 'demo123',
      'college_id': 'CSI-2026-001',
      'education': 'B.Tech',
      'role': 'superadmin_2',
    },
  };

  void _handleLogin() {
    final email = _loginEmailController.text.trim().toLowerCase();
    final pass = _loginPasswordController.text.trim();

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your registered Email address.')),
      );
      return;
    }

    if (!_registeredAccounts.containsKey(email)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Account not found! No registration history for $email. Please register first.'),
          backgroundColor: Colors.rose.shade800,
        ),
      );
      setState(() {
        _isLoginTab = false; // Switch tab to Register
      });
      return;
    }

    final acc = _registeredAccounts[email]!;
    if (acc['password'] != pass) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Incorrect password! Please check your credentials.'),
          backgroundColor: Colors.rose.shade800,
        ),
      );
      return;
    }

    _firstNameController.text = acc['first_name'] ?? 'Student';
    _middleNameController.text = acc['middle_name'] ?? '';
    _lastNameController.text = acc['last_name'] ?? 'Innovator';
    _emailController.text = acc['email'] ?? email;
    _phoneController.text = acc['phone'] ?? '';
    _collegeIdController.text = acc['college_id'] ?? '';
    _currentEducation = acc['education'] ?? 'B.Tech';
    _userRole = acc['role'] ?? 'user';

    setState(() {
      _isLoggedIn = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Welcome back, ${acc['first_name']}! Logged in as $_userRole.')),
    );
  }

  void _handleStartRegister() {
    if (_firstNameController.text.trim().isEmpty ||
        _lastNameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _registerPasswordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields (*)')),
      );
      return;
    }

    if (_registerPasswordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match! Please re-type password.')),
      );
      return;
    }

    final regEmail = _emailController.text.trim().toLowerCase();
    if (_registeredAccounts.containsKey(regEmail)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('An account with this email is already registered! Please sign in.')),
      );
      return;
    }

    setState(() {
      _registerStep = 2;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('6-Digit OTP Verification Code sent to $regEmail')),
    );
  }

  void _handleVerifyOtp() {
    String fullOtp = _otpControllers.map((c) => c.text).join();
    if (fullOtp.length < 6) {
      for (int i = 0; i < 6; i++) {
        _otpControllers[i].text = '${i + 1}';
      }
    }

    final regEmail = _emailController.text.trim().toLowerCase();
    _registeredAccounts[regEmail] = {
      'first_name': _firstNameController.text.trim(),
      'middle_name': _middleNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'email': regEmail,
      'phone': _phoneController.text.trim(),
      'password': _registerPasswordController.text.trim(),
      'college_id': _collegeIdController.text.trim(),
      'education': _currentEducation,
      'role': 'user',
    };

    _userRole = 'user';

    setState(() {
      _isLoggedIn = true;
      _registerStep = 1;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('OTP Verified successfully! Account Created with User role.')),
    );
  }

  void _handleLogout() {
    setState(() {
      _isLoggedIn = false;
      _registerStep = 1;
      _loginEmailController.clear();
      _loginPasswordController.clear();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Signed out successfully.')),
    );
  }

  @override
  void dispose() {
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _collegeIdController.dispose();
    _registerPasswordController.dispose();
    _confirmPasswordController.dispose();
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isLoggedIn) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.sky.shade50.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.sky.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isLoginTab = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: _isLoginTab ? const Color(0xFF0284C7) : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          'SIGN IN',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: _isLoginTab ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isLoginTab = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: !_isLoginTab ? const Color(0xFF0284C7) : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          'REGISTER',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: !_isLoginTab ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_isLoginTab) ...[
              TextField(
                controller: _loginEmailController,
                decoration: const InputDecoration(
                  labelText: 'Registered Email or Phone',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _loginPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  minimumSize: const Size(double.infinity, 50),
                ),
                icon: const Icon(Icons.login_rounded),
                label: const Text('LOG IN NOW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: _handleLogin,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  minimumSize: const Size(double.infinity, 48),
                ),
                icon: const Icon(Icons.flash_on_rounded, color: Colors.amber),
                label: const Text('Instant Demo Login (SuperAdmin 2)'),
                onPressed: () {
                  _loginEmailController.text = 'darshan@tgpcet.ac.in';
                  _loginPasswordController.text = 'demo123';
                  _handleLogin();
                },
              ),
            ]
            else if (_registerStep == 1) ...[
              const Text('REGISTRATION FORM', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
              const SizedBox(height: 16),
              TextField(
                controller: _firstNameController,
                decoration: const InputDecoration(
                  labelText: 'First Name *',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _middleNameController,
                decoration: const InputDecoration(
                  labelText: 'Middle Name (Optional)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _lastNameController,
                decoration: const InputDecoration(
                  labelText: 'Last Name *',
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address *',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number *',
                  prefixIcon: Icon(Icons.phone_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _collegeIdController,
                decoration: const InputDecoration(
                  labelText: 'College ID (Optional)',
                  prefixIcon: Icon(Icons.badge_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _registerPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password *',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _confirmPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Confirm Password *',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0284C7),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  minimumSize: const Size(double.infinity, 50),
                ),
                icon: const Icon(Icons.send_rounded),
                label: const Text('PROCEED TO EMAIL OTP VERIFICATION', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: _handleStartRegister,
              ),
            ]
            else ...[
              const Text('ENTER 6-DIGIT EMAIL OTP CODE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(
                  6,
                  (index) => SizedBox(
                    width: 45,
                    height: 55,
                    child: TextField(
                      controller: _otpControllers[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        counterText: '',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onChanged: (val) {
                        if (val.isNotEmpty && index < 5) {
                          FocusScope.of(context).nextFocus();
                        }
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.emerald.shade600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  minimumSize: const Size(double.infinity, 50),
                ),
                icon: const Icon(Icons.check_circle_rounded),
                label: const Text('VERIFY OTP & COMPLETE REGISTRATION', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: _handleVerifyOtp,
              ),
            ],
          ],
        ),
      );
    }

    // LOGGED IN DASHBOARD VIEW BY ROLE
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0284C7), Color(0xFF4F46E5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white,
                  child: Text(
                    _firstNameController.text.isNotEmpty ? _firstNameController.text[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0284C7)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_firstNameController.text} ${_lastNameController.text}'.trim(),
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _emailController.text,
                        style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _userRole == 'superadmin_1'
                              ? 'SUPERADMIN 1 (INCHARGE)'
                              : _userRole == 'superadmin_2'
                              ? 'SUPERADMIN 2 (DEVELOPER)'
                              : 'USER (STUDENT)',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ROLE-BASED DASHBOARD PERMISSIONS SUMMARY
          Text(
            _userRole == 'superadmin_2'
                ? 'Developer Control & Full System Access'
                : _userRole == 'superadmin_1'
                ? 'IDEA LAB Incharge Administrative Console'
                : 'User Portal & Applications',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.school_rounded, color: Colors.sky),
                    title: const Text('Education Program'),
                    subtitle: Text(_currentEducation),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.badge_rounded, color: Colors.indigo),
                    title: const Text('College ID'),
                    subtitle: Text(_collegeIdController.text.isEmpty ? 'Not Provided' : _collegeIdController.text),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.phone_rounded, color: Colors.teal),
                    title: const Text('Phone Number'),
                    subtitle: Text(_phoneController.text.isEmpty ? 'Not Provided' : _phoneController.text),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.rose.shade600,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
            onPressed: _handleLogout,
          ),
        ],
      ),
    );
  }
}
