// First create a separate file for the animation script
// Add this to your HTML files:
// <div id="background-animation"></div>
// <script src="background-animation.js"></script>

document.addEventListener('DOMContentLoaded', function() {
  // Constants for the animation
  const PARTICLE_COUNT = 125;
  const CONNECTION_DISTANCE = 100;
  const PARTICLE_SIZE = 1.5;
  const BASE_SPEED = 0.2;
  const FLOW_INTENSITY = 0.15;
  const COLOR_PRIMARY = '#f5f5dc'; // Beige
  const COLOR_SECONDARY = '#00FF9C'; // Pink accent #ff69b4 
  const BACKGROUND_COLOR = '#0c0c0c'; // Dark background
  const FADE_IN_DURATION = 1500; // Animation fade-in duration in milliseconds
  
  // Set up the canvas and context
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Target element
  const targetElement = document.getElementById('background-animation') || document.body;
  targetElement.appendChild(canvas);
  
  // Make the animation take the full width/height of the target element
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none'; // This allows mouse events to pass through
  
  // Particle class
  class Particle {
    constructor() {
      this.reset();
      // Start particles at random positions
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = PARTICLE_SIZE * (0.7 + Math.random() * 0.6);
      this.flowOffsetX = Math.random() * 1000;
      this.flowOffsetY = Math.random() * 1000;
    }
    
    reset() {
      // Random position for new or reset particles
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * BASE_SPEED;
      this.vy = (Math.random() - 0.5) * BASE_SPEED;
      this.life = 0;
      this.maxLife = 100 + Math.random() * 100;
      this.opacity = 0;
      this.targetOpacity = 0.4 + Math.random() * 0.6;
    }
    
    update(time) {
      // Increase life
      this.life++;
      
      // Handle opacity
      if (this.life < 20) {
        this.opacity = (this.life / 20) * this.targetOpacity;
      } else if (this.life > this.maxLife - 20) {
        this.opacity = ((this.maxLife - this.life) / 20) * this.targetOpacity;
      }
      
      // Perlin-like flow field effect (simplified)
      const angle = time * 0.0001 + 
                  Math.sin(this.x * 0.01 + this.flowOffsetX) * 
                  Math.cos(this.y * 0.01 + this.flowOffsetY) * FLOW_INTENSITY;
      
      // Apply flow field
      this.vx += Math.cos(angle) * 0.01;
      this.vy += Math.sin(angle) * 0.01;
      
      // Limit velocity
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > BASE_SPEED * 1.5) {
        this.vx = (this.vx / speed) * BASE_SPEED * 1.5;
        this.vy = (this.vy / speed) * BASE_SPEED * 1.5;
      }
      
      // Move particle
      this.x += this.vx;
      this.y += this.vy;
      
      // Edge wrapping with transition effect
      if (this.x < -50) this.x = canvas.width + 50;
      if (this.x > canvas.width + 50) this.x = -50;
      if (this.y < -50) this.y = canvas.height + 50;
      if (this.y > canvas.height + 50) this.y = -50;
      
      // Reset if life is over
      if (this.life >= this.maxLife) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_PRIMARY;
      ctx.fill();
    }
  }
  
  // Create particles
  let particles = [];
  
  // Mouse tracking for interactive effects
  let mouseX = -1000;
  let mouseY = -1000;
  let mouseRadius = 50; //change it later based on outputs.
  let mouseActive = false;
  
  // Initialize particles
  function init() {
    // Make sure canvas is properly sized before creating particles
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear particles array
    particles = [];
    
    // Create new particles - pre-distribute them
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = new Particle();
      
      // Explicitly distribute particles across the entire canvas
      particle.x = Math.random() * canvas.width;
      particle.y = Math.random() * canvas.height;
      
      // Give them a bit of initial life so they don't all appear at once
      particle.life = Math.random() * particle.maxLife * 0.8;
      
      // Set initial opacity based on life
      if (particle.life < 20) {
        particle.opacity = (particle.life / 20) * particle.targetOpacity;
      } else if (particle.life > particle.maxLife - 20) {
        particle.opacity = ((particle.maxLife - particle.life) / 20) * particle.targetOpacity;
      } else {
        particle.opacity = particle.targetOpacity;
      }
      
      particles.push(particle);
    }
  }
  
  // Animation function
  function animate() {
    // Request next frame
    requestAnimationFrame(animate);
    
    // Resize canvas if necessary
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      // Re-distribute particles when canvas is resized
      for (let i = 0; i < particles.length; i++) {
        // Keep some particles in their current position but ensure
        // new particles fill the new canvas dimensions
        if (Math.random() < 0.3) {
          particles[i].x = Math.random() * canvas.width;
          particles[i].y = Math.random() * canvas.height;
        }
      }
    }
    
    // Calculate fade-in effect
    if (startTime) {
      const elapsed = performance.now() - startTime;
      globalOpacityMultiplier = Math.min(1, elapsed / FADE_IN_DURATION);
    }
    
    // Clear canvas
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get current time for animation
    const time = performance.now();
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update(time);
    }
    
    // Draw connections between particles
    ctx.strokeStyle = COLOR_PRIMARY;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      
      // Skip particles with very low opacity
      if (p1.opacity < 0.05) continue;
      
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        
        // Skip particles with very low opacity
        if (p2.opacity < 0.05) continue;
        
        // Calculate distance between particles
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Connect particles if they're close enough
        if (distance < CONNECTION_DISTANCE) {
          // Calculate connection opacity based on distance
          const opacity = (1 - distance / CONNECTION_DISTANCE) * Math.min(p1.opacity, p2.opacity) * 0.8;
          
          // Draw connection
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          
          // Create slightly curved connections for organic feel
          const curveFactor = Math.sin(time * 0.0005 + i * 0.1) * 10;
          const midX = (p1.x + p2.x) / 2 + Math.sin(time * 0.001 + i * 0.5) * curveFactor;
          const midY = (p1.y + p2.y) / 2 + Math.cos(time * 0.001 + i * 0.5) * curveFactor;
          
          // Subtle bezier curve for organic feel
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          
          // Color based on distance and time
          const hue = (time * 0.01 + distance * 0.5) % 360;
          const brightness = 90 + Math.sin(time * 0.001) * 10;
          
          // Special effect near mouse
          if (mouseActive) {
            const mouseDistP1 = Math.sqrt((p1.x - mouseX) ** 2 + (p1.y - mouseY) ** 2);
            const mouseDistP2 = Math.sqrt((p2.x - mouseX) ** 2 + (p2.y - mouseY) ** 2);
            
            if (mouseDistP1 < mouseRadius || mouseDistP2 < mouseRadius) {
              // Create a highlight effect near mouse
              ctx.strokeStyle = COLOR_SECONDARY;
              ctx.globalAlpha = opacity * 1.5;
              ctx.lineWidth = 1;
            } else {
              ctx.strokeStyle = COLOR_PRIMARY;
              ctx.globalAlpha = opacity;
              ctx.lineWidth = 0.5;
            }
          } else {
            ctx.strokeStyle = COLOR_PRIMARY;
            ctx.globalAlpha = opacity;
          }
          
          ctx.stroke();
        }
      }
    }
    
    // Draw particles on top of connections
    for (let i = 0; i < particles.length; i++) {
      // Draw with fade-in effect
      ctx.globalAlpha = particles[i].opacity * globalOpacityMultiplier;
      particles[i].draw();
    }
    
    // Special effect for mouse position
    if (mouseActive) {
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_SECONDARY;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      
      // Subtle glow
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 1, mouseX, mouseY, mouseRadius);
      gradient.addColorStop(0, 'rgba(245, 245, 220, 0.3)');
      gradient.addColorStop(1, 'rgba(245, 245, 220, 0)');
      ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.3;
      ctx.fill();
    }
  }
  
  // Function to convert window coordinates to canvas coordinates
  function windowToCanvas(x, y) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (x - rect.left) * (canvas.width / rect.width),
      y: (y - rect.top) * (canvas.height / rect.height)
    };
  }
  
  // Event listeners for mouse interaction - ATTACH TO WINDOW INSTEAD OF CANVAS
  window.addEventListener('mousemove', (e) => {
    const canvasCoords = windowToCanvas(e.clientX, e.clientY);
    mouseX = canvasCoords.x;
    mouseY = canvasCoords.y;
    mouseActive = true;
    
    // Influence particles near mouse
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouseRadius) {
        // Subtle push effect
        const force = (1 - distance / mouseRadius) * 0.2;
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }
    }
  });
  
  // Keep mouse active as long as it's within the window
  window.addEventListener('mouseenter', () => {
    mouseActive = true;
  });
  
  window.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouseX = -1000;
    mouseY = -1000;
  });
  
  // Touching events for mobile - ATTACH TO WINDOW
  window.addEventListener('touchstart', (e) => {
    const canvasCoords = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    mouseX = canvasCoords.x;
    mouseY = canvasCoords.y;
    mouseActive = true;
  });
  
  window.addEventListener('touchmove', (e) => {
    const canvasCoords = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    mouseX = canvasCoords.x;
    mouseY = canvasCoords.y;
  });
  
  window.addEventListener('touchend', () => {
    mouseActive = false;
    mouseX = -1000;
    mouseY = -1000;
  });
  
  // Start animation with fade-in effect
  let startTime = null;
  let globalOpacityMultiplier = 0;
  
  function startAnimationWithFade() {
    init();
    startTime = performance.now();
    animate();
  }
  
  // Make sure everything is loaded before starting
  if (document.readyState === 'complete') {
    startAnimationWithFade();
  } else {
    window.addEventListener('load', startAnimationWithFade);
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  });
});

// --- old version ---
// document.addEventListener('DOMContentLoaded', function() {
//     // Constants for the animation
//     const PARTICLE_COUNT = 100;
//     const CONNECTION_DISTANCE = 100;
//     const PARTICLE_SIZE = 1.5;
//     const BASE_SPEED = 0.2;
//     const FLOW_INTENSITY = 0.15;
//     const COLOR_PRIMARY = '#f5f5dc'; // Beige
//     const COLOR_SECONDARY = '#ff69b4'; // Pink accent (can be adjusted)
//     const BACKGROUND_COLOR = '#0c0c0c'; // Dark background
//     const FADE_IN_DURATION = 1500; // Animation fade-in duration in milliseconds
    
//     // Set up the canvas and context
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
    
//     // Target element
//     const targetElement = document.getElementById('background-animation') || document.body;
//     targetElement.appendChild(canvas);
    
//     // Make the animation take the full width/height of the target element
//     canvas.style.position = 'absolute';
//     canvas.style.top = '0';
//     canvas.style.left = '0';
//     canvas.style.width = '100%';
//     canvas.style.height = '100%';
//     canvas.style.zIndex = '-1';
    
//     // Particle class
//     class Particle {
//       constructor() {
//         this.reset();
//         // Start particles at random positions
//         this.x = Math.random() * canvas.width;
//         this.y = Math.random() * canvas.height;
//         this.size = PARTICLE_SIZE * (0.7 + Math.random() * 0.6);
//         this.flowOffsetX = Math.random() * 1000;
//         this.flowOffsetY = Math.random() * 1000;
//       }
      
//       reset() {
//         // Random position for new or reset particles
//         this.x = Math.random() * canvas.width;
//         this.y = Math.random() * canvas.height;
//         this.vx = (Math.random() - 0.5) * BASE_SPEED;
//         this.vy = (Math.random() - 0.5) * BASE_SPEED;
//         this.life = 0;
//         this.maxLife = 100 + Math.random() * 100;
//         this.opacity = 0;
//         this.targetOpacity = 0.4 + Math.random() * 0.6;
//       }
      
//       update(time) {
//         // Increase life
//         this.life++;
        
//         // Handle opacity
//         if (this.life < 20) {
//           this.opacity = (this.life / 20) * this.targetOpacity;
//         } else if (this.life > this.maxLife - 20) {
//           this.opacity = ((this.maxLife - this.life) / 20) * this.targetOpacity;
//         }
        
//         // Perlin-like flow field effect (simplified)
//         const angle = time * 0.0001 + 
//                     Math.sin(this.x * 0.01 + this.flowOffsetX) * 
//                     Math.cos(this.y * 0.01 + this.flowOffsetY) * FLOW_INTENSITY;
        
//         // Apply flow field
//         this.vx += Math.cos(angle) * 0.01;
//         this.vy += Math.sin(angle) * 0.01;
        
//         // Limit velocity
//         const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
//         if (speed > BASE_SPEED * 1.5) {
//           this.vx = (this.vx / speed) * BASE_SPEED * 1.5;
//           this.vy = (this.vy / speed) * BASE_SPEED * 1.5;
//         }
        
//         // Move particle
//         this.x += this.vx;
//         this.y += this.vy;
        
//         // Edge wrapping with transition effect
//         if (this.x < -50) this.x = canvas.width + 50;
//         if (this.x > canvas.width + 50) this.x = -50;
//         if (this.y < -50) this.y = canvas.height + 50;
//         if (this.y > canvas.height + 50) this.y = -50;
        
//         // Reset if life is over
//         if (this.life >= this.maxLife) {
//           this.reset();
//         }
//       }
      
//       draw() {
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.fillStyle = COLOR_PRIMARY;
//         ctx.fill();
//       }
//     }
    
//     // Create particles
//     let particles = [];
    
//     // Mouse tracking for interactive effects
//     let mouseX = -1000;
//     let mouseY = -1000;
//     let mouseRadius = 120;
//     let mouseActive = false;
    
//     // Initialize particles
//     function init() {
//       // Make sure canvas is properly sized before creating particles
//       canvas.width = canvas.clientWidth;
//       canvas.height = canvas.clientHeight;
      
//       // Clear particles array
//       particles = [];
      
//       // Create new particles - pre-distribute them
//       for (let i = 0; i < PARTICLE_COUNT; i++) {
//         const particle = new Particle();
        
//         // Explicitly distribute particles across the entire canvas
//         particle.x = Math.random() * canvas.width;
//         particle.y = Math.random() * canvas.height;
        
//         // Give them a bit of initial life so they don't all appear at once
//         particle.life = Math.random() * particle.maxLife * 0.8;
        
//         // Set initial opacity based on life
//         if (particle.life < 20) {
//           particle.opacity = (particle.life / 20) * particle.targetOpacity;
//         } else if (particle.life > particle.maxLife - 20) {
//           particle.opacity = ((particle.maxLife - particle.life) / 20) * particle.targetOpacity;
//         } else {
//           particle.opacity = particle.targetOpacity;
//         }
        
//         particles.push(particle);
//       }
//     }
    
//     // Animation function
//     function animate() {
//       // Request next frame
//       requestAnimationFrame(animate);
      
//       // Resize canvas if necessary
//       if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
//         canvas.width = canvas.clientWidth;
//         canvas.height = canvas.clientHeight;
        
//         // Re-distribute particles when canvas is resized
//         for (let i = 0; i < particles.length; i++) {
//           // Keep some particles in their current position but ensure
//           // new particles fill the new canvas dimensions
//           if (Math.random() < 0.3) {
//             particles[i].x = Math.random() * canvas.width;
//             particles[i].y = Math.random() * canvas.height;
//           }
//         }
//       }
      
//       // Calculate fade-in effect
//       if (startTime) {
//         const elapsed = performance.now() - startTime;
//         globalOpacityMultiplier = Math.min(1, elapsed / FADE_IN_DURATION);
//       }
      
//       // Clear canvas
//       ctx.fillStyle = BACKGROUND_COLOR;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
      
//       // Get current time for animation
//       const time = performance.now();
      
//       // Update and draw particles
//       for (let i = 0; i < particles.length; i++) {
//         particles[i].update(time);
//       }
      
//       // Draw connections between particles
//       ctx.strokeStyle = COLOR_PRIMARY;
//       ctx.lineWidth = 0.5;
      
//       for (let i = 0; i < particles.length; i++) {
//         const p1 = particles[i];
        
//         // Skip particles with very low opacity
//         if (p1.opacity < 0.05) continue;
        
//         for (let j = i + 1; j < particles.length; j++) {
//           const p2 = particles[j];
          
//           // Skip particles with very low opacity
//           if (p2.opacity < 0.05) continue;
          
//           // Calculate distance between particles
//           const dx = p2.x - p1.x;
//           const dy = p2.y - p1.y;
//           const distance = Math.sqrt(dx * dx + dy * dy);
          
//           // Connect particles if they're close enough
//           if (distance < CONNECTION_DISTANCE) {
//             // Calculate connection opacity based on distance
//             const opacity = (1 - distance / CONNECTION_DISTANCE) * Math.min(p1.opacity, p2.opacity) * 0.8;
            
//             // Draw connection
//             ctx.beginPath();
//             ctx.moveTo(p1.x, p1.y);
            
//             // Create slightly curved connections for organic feel
//             const curveFactor = Math.sin(time * 0.0005 + i * 0.1) * 10;
//             const midX = (p1.x + p2.x) / 2 + Math.sin(time * 0.001 + i * 0.5) * curveFactor;
//             const midY = (p1.y + p2.y) / 2 + Math.cos(time * 0.001 + i * 0.5) * curveFactor;
            
//             // Subtle bezier curve for organic feel
//             ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            
//             // Color based on distance and time
//             const hue = (time * 0.01 + distance * 0.5) % 360;
//             const brightness = 90 + Math.sin(time * 0.001) * 10;
            
//             // Special effect near mouse
//             if (mouseActive) {
//               const mouseDistP1 = Math.sqrt((p1.x - mouseX) ** 2 + (p1.y - mouseY) ** 2);
//               const mouseDistP2 = Math.sqrt((p2.x - mouseX) ** 2 + (p2.y - mouseY) ** 2);
              
//               if (mouseDistP1 < mouseRadius || mouseDistP2 < mouseRadius) {
//                 // Create a highlight effect near mouse
//                 ctx.strokeStyle = COLOR_SECONDARY;
//                 ctx.globalAlpha = opacity * 1.5;
//                 ctx.lineWidth = 1;
//               } else {
//                 ctx.strokeStyle = COLOR_PRIMARY;
//                 ctx.globalAlpha = opacity;
//                 ctx.lineWidth = 0.5;
//               }
//             } else {
//               ctx.strokeStyle = COLOR_PRIMARY;
//               ctx.globalAlpha = opacity;
//             }
            
//             ctx.stroke();
//           }
//         }
//       }
      
//       // Draw particles on top of connections
//       for (let i = 0; i < particles.length; i++) {
//         // Draw with fade-in effect
//     ctx.globalAlpha = particles[i].opacity * globalOpacityMultiplier;
//     particles[i].draw();
//       }
      
//       // Special effect for mouse position
//       if (mouseActive) {
//         ctx.beginPath();
//         ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
//         ctx.fillStyle = COLOR_SECONDARY;
//         ctx.globalAlpha = 0.7;
//         ctx.fill();
        
//         // Subtle glow
//         ctx.beginPath();
//         const gradient = ctx.createRadialGradient(mouseX, mouseY, 1, mouseX, mouseY, mouseRadius);
//         gradient.addColorStop(0, 'rgba(245, 245, 220, 0.3)');
//         gradient.addColorStop(1, 'rgba(245, 245, 220, 0)');
//         ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
//         ctx.fillStyle = gradient;
//         ctx.globalAlpha = 0.3;
//         ctx.fill();
//       }
//     }
    
//     // Event listeners for mouse interaction
//     canvas.addEventListener('mousemove', (e) => {
//       mouseX = e.offsetX;
//       mouseY = e.offsetY;
//       mouseActive = true;
      
//       // Influence particles near mouse
//       for (let i = 0; i < particles.length; i++) {
//         const p = particles[i];
//         const dx = p.x - mouseX;
//         const dy = p.y - mouseY;
//         const distance = Math.sqrt(dx * dx + dy * dy);
        
//         if (distance < mouseRadius) {
//           // Subtle push effect
//           const force = (1 - distance / mouseRadius) * 0.2;
//           p.vx += (dx / distance) * force;
//           p.vy += (dy / distance) * force;
//         }
//       }
//     });
    
//     canvas.addEventListener('mouseleave', () => {
//       mouseActive = false;
//     });
    
//     // Touching events for mobile
//     canvas.addEventListener('touchstart', (e) => {
//       e.preventDefault();
//       mouseActive = true;
//       mouseX = e.touches[0].clientX;
//       mouseY = e.touches[0].clientY;
//     });
    
//     canvas.addEventListener('touchmove', (e) => {
//       e.preventDefault();
//       mouseX = e.touches[0].clientX;
//       mouseY = e.touches[0].clientY;
//     });
    
//     canvas.addEventListener('touchend', () => {
//       mouseActive = false;
//     });
    
//     // Start animation with fade-in effect
//     let startTime = null;
//     let globalOpacityMultiplier = 0;
    
//     function startAnimationWithFade() {
//       init();
//       startTime = performance.now();
//       animate();
//     }
    
//     // Make sure everything is loaded before starting
//     if (document.readyState === 'complete') {
//       startAnimationWithFade();
//     } else {
//       window.addEventListener('load', startAnimationWithFade);
//     }
    
//     // Handle window resize
//     window.addEventListener('resize', () => {
//       canvas.width = canvas.clientWidth;
//       canvas.height = canvas.clientHeight;
//     });
//   });