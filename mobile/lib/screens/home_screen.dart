import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // BANNER CARD WITH CURVES
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0284C7), Color(0xFF4F46E5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0284C7).withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AICTE IDEA LAB',
                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.extrabold),
                ),
                SizedBox(height: 4),
                Text(
                  'Tulsiramji Gaikwad Patil College of Engineering & Technology',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                SizedBox(height: 12),
                Text(
                  'Incharge: Dr. Neeraj Waijode',
                  style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // UPDATES MARQUEE BADGE
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.sky.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.sky.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.bolt_rounded, color: Colors.amber),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '🔥 Registration open for 3D Printing & Robotics Boot Camp 2026!',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // VISION & MISSION
          const Text('VISION & MISSION', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.sky)),
          const SizedBox(height: 8),
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 2,
            child: const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'To establish IDEA LAB as a Centre of Excellence for innovation, design, research, and interdisciplinary learning that empowers students to transform ideas into impactful real-world solutions.',
                style: TextStyle(fontSize: 13, height: 1.4),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // HORIZONTAL SCROLLING IMAGES
          const Text('LIFE INSIDE IDEA LAB', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.sky)),
          const SizedBox(height: 12),
          SizedBox(
            height: 140,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildGalleryCard('3D Printing Studio', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'),
                _buildGalleryCard('6-Axis Robotic Arm', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'),
                _buildGalleryCard('IoT PCB Etching', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGalleryCard(String title, String imageUrl) {
    return Container(
      width: 220,
      margin: const EdgeInsets.only(right: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                color: Colors.slate.shade800,
                alignment: Alignment.center,
                child: const Icon(Icons.photo_rounded, size: 36, color: Colors.sky),
              ),
            ),
            Container(
              alignment: Alignment.bottomLeft,
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.black87, Colors.transparent],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
              child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }
}
