import 'package:flutter/material.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  final List<Map<String, dynamic>> projects = [
    {
      'title': 'Autonomous AI Inspection Rover',
      'leader': 'Darshan (Chief Student Innovator)',
      'desc': '6-wheel rocker-bogie rover built with ROS2 and custom CNC PCB motor drivers for hazardous inspection.',
      'image': 'https://images.unsplash.com/photo-1563770660941-20978e770fa3?auto=format&fit=crop&w=600&q=80',
      'team': ['Darshan (Lead)', 'Aarav Mehta (PCB)', 'Priya Sharma (CAD)'],
    },
    {
      'title': 'Smart IoT Agriculture System',
      'leader': 'Neha Verma',
      'desc': 'Precision farming soil moisture telemetry device fabricated with CNC PCB etching.',
      'image': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
      'team': ['Neha Verma (IoT Lead)', 'Rohan Gupta (Embedded)'],
    },
    {
      'title': '6-DOF Robotic Arm Haptic Controller',
      'leader': 'Vikram Singh',
      'desc': 'Custom tele-operated haptic glove controlling the 6-Axis Industrial Robotic Arm.',
      'image': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
      'team': ['Vikram Singh (Robotics Lead)', 'Tanvi Rao (Mechatronics)'],
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: projects.length,
      itemBuilder: (context, idx) {
        final p = projects[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                builder: (_) => Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p['title']!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Lead: ${p['leader']}', style: const TextStyle(color: Colors.sky, fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 12),
                      Text(p['desc']!, style: const TextStyle(fontSize: 13, height: 1.4)),
                      const SizedBox(height: 16),
                      const Text('Student Builders:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      const SizedBox(height: 6),
                      ...((p['team'] as List<String>).map((m) => Text('• $m', style: const TextStyle(fontSize: 12)))),
                    ],
                  ),
                ),
              );
            },
            child: Stack(
              alignment: Alignment.bottomLeft,
              children: [
                Image.network(
                  p['image']!,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 180,
                    color: Colors.slate.shade800,
                    alignment: Alignment.center,
                    child: const Icon(Icons.stars_rounded, size: 40, color: Colors.cyanAccent),
                  ),
                ),
                Container(
                  height: 180,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [Colors.black87, Colors.transparent], begin: Alignment.bottomCenter, end: Alignment.topCenter),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('TAP TO VIEW DETAILS', style: TextStyle(color: Colors.cyanAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      Text(p['title']!, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
