
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import Link from "next/link";

function FloatingPills() {
    const count = 30;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const seeded = (seed: number) => {
        const x = Math.sin(seed * 9999.1) * 43758.5453;
        return x - Math.floor(x);
    };

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = seeded(i + 1) * 100;
            const factor = 20 + seeded(i + 101) * 100;
            const speed = 0.01 + seeded(i + 201) / 200;
            const xFactor = -50 + seeded(i + 301) * 100;
            const yFactor = -50 + seeded(i + 401) * 100;
            const zFactor = -50 + seeded(i + 501) * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            particle.t += particle.speed / 2;
            const t = particle.t;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + particle.xFactor + Math.cos((t / 10) * particle.factor) + (Math.sin(t * 1) * particle.factor) / 10,
                (particle.my / 10) * b + particle.yFactor + Math.sin((t / 10) * particle.factor) + (Math.cos(t * 2) * particle.factor) / 10,
                (particle.my / 10) * b + particle.zFactor + Math.cos((t / 10) * particle.factor) + (Math.sin(t * 3) * particle.factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhysicalMaterial color="#9D50BB" roughness={0} metalness={0.5} emissive="#E082FF" emissiveIntensity={0.5} />
        </instancedMesh>
    );
}

export function Hero3D() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#E082FF" />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                        <FloatingPills />
                    </Float>
                </Canvas>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative inline-block"
                >
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-electric to-neon bluropacity-25 animate-pulse"></div>
                    <div className="relative rounded-full bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-1.5 text-sm text-neon font-medium">
                        ✨ Umbra AI 2.0
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
                >
                    Autoridade Digital, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-neon neon-text">
                        Construída nos Bastidores
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Transforme seu conhecimento técnico em influência real. A Umbra aprende sua voz e gerencia sua presença no LinkedIn e Instagram de forma autônoma, enquanto você foca no que realmente importa.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/onboarding" className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                        Começar Grátis
                    </Link>
                    <button
                        onClick={() => document.getElementById('features-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-md"
                    >
                        Ver Demo
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
