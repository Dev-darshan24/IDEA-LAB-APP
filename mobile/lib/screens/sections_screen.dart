import 'package:flutter/material.dart';

class SectionsScreen extends StatelessWidget {
  const SectionsScreen({super.key});

  final List<Map<String, String>> sections = const [
    {
      'title': 'SOFTWARE CELL',
      'head': 'Prof. A. K. Sharma',
      'desc': 'Multiple PCs with AutoCAD, Fusion 360, VS Code, SolidWorks, and simulation suites.',
      'image': 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    },
    {
      'title': 'IOT & PCB DESIGN',
      'head': 'Dr. R. V. Deshmukh',
      'desc': 'IoT microcontrollers, sensors, and automated CNC IoT PCB Design Machine.',
      'image': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    },
    {
      'title': '3D PRINTING & PROTOTYPING',
      'head': 'Prof. S. N. Kulkarni',
      'desc': '2 High precision 3D Printers (Industrial FDM + Resin SLA).',
      'image': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
    {
      'title': 'ROBOTICS & AUTOMATION',
      'head': 'Prof. M. B. Patil',
      'desc': '6-Axis Industrial Robotic Arm, CNC Lathe, and CNC Milling Machine.',
      'image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    },
    {
      'title': 'MACHINING & FABRICATION',
      'head': 'Prof. V. P. Joshi',
      'desc': 'CO2 Laser Cutting Machine, CNC Router Machine, and Lathe Machine.',
      'image': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sections.length,
      itemBuilder: (context, idx) {
        final sec = sections[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.network(
                sec['image']!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 160,
                  color: Colors.slate.shade800,
                  alignment: Alignment.center,
                  child: const Icon(Icons.layers_rounded, size: 40, color: Colors.sky),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(sec['title']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0284C7))),
                    const SizedBox(height: 4),
                    Text(sec['desc']!, style: const TextStyle(fontSize: 12, height: 1.4)),
                    const SizedBox(height: 8),
                    Text('Section Head: ${sec['head']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
