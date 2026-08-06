import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';
import 'screens/sections_screen.dart';
import 'screens/projects_screen.dart';
import 'screens/gallery_screen.dart';
import 'screens/profile_screen.dart';
import 'widgets/custom_drawer.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const IdeaLabApp());
}

class IdeaLabApp extends StatefulWidget {
  const IdeaLabApp({super.key});

  @override
  State<IdeaLabApp> createState() => _IdeaLabAppState();
}

class _IdeaLabAppState extends State<IdeaLabApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AICTE IDEA LAB TGPCET',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.sky,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.sky,
        scaffoldBackgroundColor: const Color(0xFF030712),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      ),
      home: MainNavigationContainer(toggleTheme: toggleTheme, isDark: _themeMode == ThemeMode.dark),
    );
  }
}

class MainNavigationContainer extends StatefulWidget {
  final VoidCallback toggleTheme;
  final bool isDark;

  const MainNavigationContainer({super.key, required this.toggleTheme, required this.isDark});

  @override
  State<MainNavigationContainer> createState() => _MainNavigationContainerState();
}

class _MainNavigationContainerState extends State<MainNavigationContainer> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomeScreen(),
    const SectionsScreen(),
    const ProjectsScreen(),
    const GalleryScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AICTE IDEA LAB',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              'TGPCET Nagpur',
              style: TextStyle(fontSize: 11, color: Colors.sky),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.toggleTheme,
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('No new notifications from Dr. Neeraj Waijode')),
              );
            },
          ),
        ],
      ),
      drawer: CustomDrawer(toggleTheme: widget.toggleTheme, isDark: widget.isDark),
      body: _pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.layers_rounded), label: 'Sections'),
          NavigationDestination(icon: Icon(Icons.stars_rounded), label: 'Projects'),
          NavigationDestination(icon: Icon(Icons.photo_library_rounded), label: 'Gallery'),
          NavigationDestination(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }
}
