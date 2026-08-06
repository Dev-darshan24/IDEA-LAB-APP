import 'package:flutter/foundation.dart';

enum UserRole { user, superadmin_1, superadmin_2 }

class UserProfileModel {
  final String id;
  final String firstName;
  final String? middleName;
  final String lastName;
  final String email;
  final String phone;
  final String? collegeId;
  final String currentEducation;
  final UserRole role;
  final bool emailVerified;

  UserProfileModel({
    required this.id,
    required this.firstName,
    this.middleName,
    required this.lastName,
    required this.email,
    required this.phone,
    this.collegeId,
    required this.currentEducation,
    required this.role,
    required this.emailVerified,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) {
    String rStr = json['role']?.toString().toLowerCase() ?? 'user';
    UserRole r = UserRole.user;
    if (rStr == 'superadmin_1' || rStr == 'admin_incharge') {
      r = UserRole.superadmin_1;
    } else if (rStr == 'superadmin_2' || rStr == 'admin_developer') {
      r = UserRole.superadmin_2;
    }

    return UserProfileModel(
      id: json['id'] ?? '',
      firstName: json['first_name'] ?? '',
      middleName: json['middle_name'] ?? '',
      lastName: json['last_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      collegeId: json['college_id'] ?? '',
      currentEducation: json['education'] ?? json['current_education'] ?? 'B.Tech',
      role: r,
      emailVerified: json['email_verified'] ?? true,
    );
  }
}

class AuthService extends ChangeNotifier {
  UserProfileModel? _currentUser;
  bool _isLoading = false;

  UserProfileModel? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  bool get isLoading => _isLoading;

  bool get isUser => _currentUser?.role == UserRole.user;
  bool get isSuperAdmin1 => _currentUser?.role == UserRole.superadmin_1;
  bool get isSuperAdmin2 => _currentUser?.role == UserRole.superadmin_2;

  final Map<String, Map<String, dynamic>> _userRegistry = {
    'incharge@tgpcet.ac.in': {
      'id': 'incharge-uuid-001',
      'first_name': 'Dr. Neeraj',
      'last_name': 'Waijode',
      'email': 'incharge@tgpcet.ac.in',
      'phone': '+91 9876543210',
      'password': 'demo123',
      'college_id': 'FAC-IDEA-01',
      'education': 'Other',
      'role': 'superadmin_1',
      'email_verified': true,
    },
    'darshan@tgpcet.ac.in': {
      'id': 'developer-uuid-002',
      'first_name': 'Darshan',
      'last_name': 'Developer',
      'email': 'darshan@tgpcet.ac.in',
      'phone': '+91 9123456789',
      'password': 'demo123',
      'college_id': 'CSI-2026-001',
      'education': 'B.Tech',
      'role': 'superadmin_2',
      'email_verified': true,
    },
  };

  Future<Map<String, dynamic>> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    final cleanEmail = email.trim().toLowerCase();
    if (!_userRegistry.containsKey(cleanEmail)) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'Account not found! No registration history found. Please register first.',
      };
    }

    final acc = _userRegistry[cleanEmail]!;
    if (acc['password'] != password.trim()) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'Incorrect password! Please check your password.',
      };
    }

    _currentUser = UserProfileModel.fromJson(acc);
    _isLoading = false;
    notifyListeners();

    return {
      'success': true,
      'message': 'Welcome back, ${_currentUser!.firstName}!',
      'role': _currentUser!.role,
    };
  }

  Future<Map<String, dynamic>> register({
    required String firstName,
    String? middleName,
    required String lastName,
    required String email,
    required String phone,
    String? collegeId,
    required String password,
  }) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    final cleanEmail = email.trim().toLowerCase();
    if (_userRegistry.containsKey(cleanEmail)) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': 'An account with this email is already registered!',
      };
    }

    final newUser = {
      'id': 'usr-${DateTime.now().millisecondsSinceEpoch}',
      'first_name': firstName,
      'middle_name': middleName ?? '',
      'last_name': lastName,
      'email': cleanEmail,
      'phone': phone,
      'college_id': collegeId ?? '',
      'password': password,
      'education': 'B.Tech',
      'role': 'user',
      'email_verified': true,
    };

    _userRegistry[cleanEmail] = newUser;
    _currentUser = UserProfileModel.fromJson(newUser);

    _isLoading = false;
    notifyListeners();

    return {
      'success': true,
      'message': 'Registration successful! Role assigned: User.',
    };
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }
}
