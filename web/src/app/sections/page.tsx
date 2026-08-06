'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Printer, Bot, Wrench, Monitor, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';

const SECTIONS_DATA = [
  {
    id: 'software-cell',
    title: 'SOFTWARE CELL',
    head: 'Prof. A. K. Sharma',
    headTitle: 'Head of Software Prototyping Cell',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    icon: Monitor,
    color: 'from-blue-600 to-indigo-600',
    summary: 'High-performance computing workstations equipped with industry-standard CAD, CAM, coding, and simulation tools.',
    equipments: [
      'High-Performance Intel i9 / RTX 4080 Workstations',
      'Autodesk AutoCAD & Fusion 360',
      'SolidWorks & ANSYS Simulation Suite',
      'VS Code & Full-Stack Prototyping IDEs',
      'MATLAB & Simulink License',
    ],
    docDetail: 'The Software Cell serves as the digital foundation of IDEA LAB. Students design complex 3D models, perform finite element analysis (FEA), simulate electronic schematics, and write firmware for robotic platforms before physical fabrication.'
  },
  {
    id: 'iot-pcb-design',
    title: 'IOT & PCB DESIGN',
    head: 'Dr. R. V. Deshmukh',
    headTitle: 'Head of Embedded Systems & IoT',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    icon: Cpu,
    color: 'from-cyan-600 to-sky-600',
    summary: 'Comprehensive IoT electronic components studio featuring an automated CNC IoT PCB Design Machine.',
    equipments: [
      'CNC IoT PCB Milling & Etching Machine',
      'Digital Storage Oscilloscopes (DSO) & Spectrum Analyzers',
      'SMD Soldering & Desoldering Stations',
      'ESP32, STM32, Raspberry Pi & Sensor Arrays',
      'LoRa, Zigbee & Cellular IoT Gateways',
    ],
    docDetail: 'Dedicated to micro-electronics, embedded hardware development, and IoT telemetry. With our automated CNC PCB machine, circuit schematics designed in software are etched onto double-sided copper plates within minutes.'
  },
  {
    id: '3d-printing-prototyping',
    title: '3D PRINTING & PROTOTYPING',
    head: 'Prof. S. N. Kulkarni',
    headTitle: 'Head of Additive Manufacturing',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    icon: Printer,
    color: 'from-emerald-600 to-teal-600',
    summary: 'Additive manufacturing hub housing dual high-precision 3D Printers for rapid physical prototype generation.',
    equipments: [
      'Industrial FDM 3D Printer 01 (Dual Extruder)',
      'High-Precision SLA Resin 3D Printer 02',
      'Handheld 3D Laser Scanner',
      'PLA, ABS, PETG, TPU & Carbon Fiber Filaments',
      'Post-Processing Ultrasonic Cleaning Bath',
    ],
    docDetail: 'Enables rapid physical iteration of complex mechanical components. The SLA and FDM 3D printers transform CAD models into durable, functional prototypes overnight.'
  },
  {
    id: 'robotics-automation',
    title: 'ROBOTICS & AUTOMATION',
    head: 'Prof. M. B. Patil',
    headTitle: 'Head of Robotics & Mechatronics',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    icon: Bot,
    color: 'from-indigo-600 to-purple-600',
    summary: 'Advanced automation cell featuring a 6-Axis Industrial Robotic Arm, CNC Lathe, and CNC Milling Machine.',
    equipments: [
      '6-Axis Industrial Robotic Arm with Vision System',
      'Precision Industrial CNC Lathe Machine',
      '3-Axis CNC Milling Machine',
      'Industrial PLC & Automation Workstations',
      'Pneumatics & Hydraulics Training Bench',
    ],
    docDetail: 'Designed for high-precision manufacturing, automated assembly research, and industrial robotics training. Students learn robot kinematics, G-code programming, and automated quality control.'
  },
  {
    id: 'machining-fabrication',
    title: 'MACHINING & FABRICATION',
    head: 'Prof. V. P. Joshi',
    headTitle: 'Head of Manufacturing & Fabrication',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    icon: Wrench,
    color: 'from-amber-600 to-orange-600',
    summary: 'Heavy-duty fabrication studio including high-precision CO2 Laser Cutting Machine, CNC Router, and Lathe Machine.',
    equipments: [
      'High-Power CO2 Laser Cutting Machine (Acrylic, Wood, Metals)',
      'Large Format CNC Router Machine',
      'Heavy Duty Mechanical Lathe Machine',
      'MIG / TIG Welding Rig & Metal Bender',
      'Sheet Metal Shear & Hydraulic Press',
    ],
    docDetail: 'The heavy fabrication unit allows full-scale structural assembly. From laser-cut enclosures to CNC routed wooden/metallic chassis, students manufacture industrial-grade prototypes.'
  },
];

export default function SectionsPage() {
  return (
    <div className="space-y-12 pb-12">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-sky-600 dark:text-cyan-400 bg-sky-100 dark:bg-sky-950/60 uppercase tracking-widest">
          AICTE IDEA LAB FACILITY
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          5 Specialized Technical Sections
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
          Documentary showcase of world-class prototyping facilities at Tulsiramji Gaikwad Patil College of Engineering & Technology.
        </p>
      </div>

      {/* DOCUMENTARY SECTION LIST */}
      <div className="space-y-12">
        {SECTIONS_DATA.map((section, idx) => {
          const Icon = section.icon;
          const isEven = idx % 2 === 0;
          return (
            <div
              key={section.id}
              id={section.id}
              className="glass-card rounded-4xl border border-sky-500/20 overflow-hidden shadow-xl flex flex-col lg:flex-row"
            >
              {/* IMAGE SIDE */}
              <div className={`lg:w-1/2 h-72 lg:h-auto relative ${isEven ? 'lg:order-first' : 'lg:order-last'}`}>
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-4 left-4 lg:hidden text-white">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-sky-600 px-2.5 py-1 rounded-full">
                    Section {idx + 1}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{section.title}</h3>
                </div>
              </div>

              {/* DETAILS SIDE */}
              <div className="lg:w-1/2 p-6 md:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="hidden lg:flex items-center space-x-3">
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-r ${section.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-sky-500 tracking-widest uppercase">
                        SECTION 0{idx + 1}
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-sky-600 dark:text-cyan-400">
                    {section.summary}
                  </p>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {section.docDetail}
                  </p>

                  {/* EQUIPMENT HIGHLIGHTS */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Key Machines & Software Installed:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {section.equipments.map((eq, eIdx) => (
                        <div key={eIdx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{eq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION HEAD BADGE & CTA */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm border border-sky-500/30">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {section.head}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {section.headTitle}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/apply"
                    className="px-4 py-2 rounded-full text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition flex items-center space-x-1"
                  >
                    <span>Reserve Machine</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
