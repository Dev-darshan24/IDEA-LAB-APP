import 'package:flutter/material.dart';

class GalleryScreen extends StatelessWidget {
  const GalleryScreen({super.key});

  final List<Map<String, String>> gallery = const [
    {
      'title': 'IDEA LAB Inauguration',
      'date': '2026-08-01',
      'image': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'
    },
    {
      'title': 'Prototyping Hackathon',
      'date': '2026-07-28',
      'image': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'
    },
    {
      'title': '6-Axis Robotic Demo',
      'date': '2026-07-15',
      'image': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12),
      itemCount: gallery.length,
      itemBuilder: (context, idx) {
        final item = gallery[idx];
        return ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.network(
                item['image']!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: Colors.slate.shade800,
                  alignment: Alignment.center,
                  child: const Icon(Icons.photo_library_rounded, size: 36, color: Colors.cyanAccent),
                ),
              ),
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [Colors.black87, Colors.transparent], begin: Alignment.bottomCenter, end: Alignment.topCenter),
                ),
              ),
              Positioned(
                bottom: 8,
                left: 8,
                right: 8,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['title']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(item['date']!, style: const TextStyle(color: Colors.cyanAccent, fontSize: 10)),
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }
}
