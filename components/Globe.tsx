
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PilotState, PlanetState, TourLocation } from '../types';
import { TEXTURE_URLS } from '../constants';

interface GlobeProps {
  pilot: PilotState;
  planetState: PlanetState;
  selectedLocation: TourLocation | null;
}

export const Globe: React.FC<GlobeProps> = ({ pilot, planetState, selectedLocation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    earth: THREE.Mesh;
    clouds: THREE.Mesh;
    stars: THREE.Points;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = pilot.elevation;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(TEXTURE_URLS.day);
    const nightTexture = textureLoader.load(TEXTURE_URLS.night);
    const cloudsTexture = textureLoader.load(TEXTURE_URLS.clouds);

    // Earth Geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      specular: new THREE.Color('grey'),
      shininess: 10,
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Clouds
    const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.8,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // Stars background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    sceneRef.current = { renderer, scene, camera, earth, clouds, stars };

    const animate = () => {
      if (!sceneRef.current) return;
      const { renderer, scene, camera, earth, clouds } = sceneRef.current;

      // Handle Pilot Controls
      if (pilot.isSpinning) {
        earth.rotation.y += 0.002;
        clouds.rotation.y += 0.003;
      }
      
      earth.rotation.y += pilot.rotationY * 0.1;
      earth.rotation.x += pilot.rotationX * 0.1;

      // Bouncing "Dance" mode
      if (pilot.isBouncing) {
        earth.position.y = Math.sin(Date.now() * 0.005) * 0.1;
        earth.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.02);
      } else {
        earth.position.y = 0;
        earth.scale.setScalar(1);
      }

      // Smooth camera transition
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pilot.elevation, 0.1);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Effect for PlanetState
  useEffect(() => {
    if (!sceneRef.current) return;
    const { earth, clouds } = sceneRef.current;
    const mat = earth.material as THREE.MeshPhongMaterial;

    const textureLoader = new THREE.TextureLoader();

    switch (planetState) {
      case PlanetState.FIRE:
        mat.color.setHex(0xff4400);
        mat.emissive.setHex(0xff2200);
        mat.emissiveIntensity = 0.5;
        break;
      case PlanetState.FREEZE:
        mat.color.setHex(0xbbffff);
        mat.emissive.setHex(0x00ffff);
        mat.emissiveIntensity = 0.2;
        break;
      case PlanetState.NIGHT:
        mat.map = textureLoader.load(TEXTURE_URLS.night);
        mat.color.setHex(0x333333);
        mat.emissive.setHex(0xffffff);
        mat.emissiveIntensity = 1.0;
        break;
      case PlanetState.NORMAL:
      default:
        mat.map = textureLoader.load(TEXTURE_URLS.day);
        mat.color.setHex(0xffffff);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        break;
    }
    mat.needsUpdate = true;
  }, [planetState]);

  // Effect for Location Navigation
  useEffect(() => {
    if (!selectedLocation || !sceneRef.current) return;
    const { earth } = sceneRef.current;
    
    // Convert Lat/Lng to rotation
    const lat = selectedLocation.coords[0];
    const lng = selectedLocation.coords[1];
    
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    // Reset rotation and move to target
    earth.rotation.set(phi - Math.PI / 2, theta - Math.PI / 2, 0);
  }, [selectedLocation]);

  return <div ref={containerRef} className="w-full h-full cursor-move" />;
};
