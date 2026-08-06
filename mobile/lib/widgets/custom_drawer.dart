import 'package:flutter/material.dart';

class CustomDrawer extends StatelessWidget {
  final VoidCallback toggleTheme;
  final bool isDark;

  const CustomDrawer({super.key, required this.toggleTheme, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0284C7), Color(0xFF4F46E5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            currentAccountPicture: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person_rounded, size: 36, color: Color(0xFF0284C7)),
            ),
            accountName: const Text('AICTE IDEA LAB Student Portal', style: TextStyle(fontWeight: FontWeight.bold)),
            accountEmail: const Text('TGPCET Nagpur • Guest / Member Session'),
          ),
          ListTile(
            leading: const Icon(Icons.home_rounded, color: Colors.sky),
            title: const Text('HOME'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.login_rounded, color: Colors.blueAccent),
            title: const Text('LOG IN'),
            subtitle: const Text('Sign in to existing account', style: TextStyle(fontSize: 11)),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Navigate to Profile tab to Log In')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.person_add_rounded, color: Colors.teal),
            title: const Text('REGISTER'),
            subtitle: const Text('Create new student account', style: TextStyle(fontSize: 11)),
            onTap: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Navigate to Profile tab to Register')),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.stars_rounded, color: Colors.amber),
            title: const Text('PROJECTS'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library_rounded, color: Colors.emerald),
            title: const Text('GALLERY'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.auto_awesome_rounded, color: Colors.cyan),
            title: const Text('STUDENT INNOVATION CHAPTER'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.layers_rounded, color: Colors.indigo),
            title: const Text('ABOUT & SECTIONS'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.support_agent_rounded, color: Colors.orange),
            title: const Text('CONTACT US'),
            onTap: () => Navigator.pop(context),
          ),
          ListTile(
            leading: const Icon(Icons.account_circle_rounded, color: Colors.blue),
            title: const Text('PROFILE / LOGIN & REGISTER'),
            onTap: () => Navigator.pop(context),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              icon: const Icon(Icons.send_rounded),
              label: const Text('APPLY PROPOSAL', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening Project Application Form...')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
